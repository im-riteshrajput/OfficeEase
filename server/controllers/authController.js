import { Admin, HR, Employee } from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to get model based on role
const getModelByRole = (role) => {
  if (role === 'Admin') return Admin;
  if (role === 'Human Resources') return HR;
  return Employee;
};

// REGISTER
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
      estatus
    } = req.body;

    // Check if employee exists in any collection
    const [adminExist, hrExist, empExist] = await Promise.all([
      Admin.findOne({ email }),
      HR.findOne({ email }),
      Employee.findOne({ email })
    ]);

    if (adminExist || hrExist || empExist) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const Model = getModelByRole(dbRole);

    const employee = new Model({
      name,
      email,
      password: hashedPassword,
      dbRole,
      jobRole,
      department,
      phone,
      joinDate,
      estatus
    });

    await employee.save();

    res.status(201).json({ message: "Employee registered successfully" });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json(error);
  }
};


// LOGIN
const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Search across all collections
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

export { register, login };