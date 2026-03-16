import { Admin, HR, Employee } from "../models/Employee.js";
import PendingUser from "../models/PendingUser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to get model based on role
const getModelByRole = (role) => {
  if (role === 'Admin') return Admin;
  if (role === 'Human Resources') return HR;
  return Employee;
};

// REGISTER — save to PendingUser collection
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      dbRole,
      jobRole,
      department,
      phone,
      joinDate,
    } = req.body;

    const emailRegex = /^.+?\.bimfrox@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Only emails ending with .bimfrox@gmail.com are allowed." });
    }

    // Check if user exists in any collection (including pending)
    const [adminExist, hrExist, empExist, pendingExist] = await Promise.all([
      Admin.findOne({ email }),
      HR.findOne({ email }),
      Employee.findOne({ email }),
      PendingUser.findOne({ email })
    ]);

    if (adminExist || hrExist || empExist) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    if (pendingExist) {
      return res.status(400).json({ message: "An application with this email is already pending approval" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pendingUser = new PendingUser({
      name,
      email,
      password: hashedPassword,
      dbRole,
      jobRole,
      department,
      phone,
      joinDate,
      estatus: "pending"
    });

    await pendingUser.save();

    res.status(201).json({ message: "Application submitted successfully! Please wait for approval." });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json(error);
  }
};


// LOGIN — check pending first, then actual collections
const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Check if user is in pending collection
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      const validPendingPassword = await bcrypt.compare(password, pendingUser.password);
      if (validPendingPassword) {
        return res.status(403).json({ status: "pending", message: "Your account is pending approval by Admin/HR." });
      }
    }

    // Search across all active collections
    const [admin, hr, employee] = await Promise.all([
        Admin.findOne({ email }),
        HR.findOne({ email }),
        Employee.findOne({ email })
    ]);

    const user = admin || hr || employee;

    if (!user)
      return res.status(400).json({ message: "Invalid email" });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.dbRole },
      process.env.JWT_SECRET || "riteshSecret123",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      employee: user
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json(error);
  }
};

const checkStatus = async (req, res) => {
  try {
    const { email } = req.params;

    // 1. Check if user is still pending
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      return res.json({ status: "pending" });
    }

    // 2. Check if user is in an active collection (Approved)
    const standardEmployee = await Employee.findOne({ email });
    
    // Check other collections too
    let activeUser = standardEmployee;
    if (!activeUser) activeUser = await Admin.findOne({ email });
    if (!activeUser) activeUser = await HR.findOne({ email });

    if (activeUser) {
      return res.json({ status: "approved" });
    }

    // 3. User not found anywhere (likely rejected and deleted from pending)
    return res.json({ status: "rejected" });

  } catch (err) {
    console.error("STATUS CHECK ERROR:", err);
    res.status(500).json({ message: "Server error checking status" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    // Find the user by ID across active collections
    const [admin, hr, employee] = await Promise.all([
      Admin.findById(userId),
      HR.findById(userId),
      Employee.findById(userId)
    ]);

    const user = admin || hr || employee;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Hash the new password and save
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error during password change" });
  }
};

export { register, login, checkStatus, changePassword };