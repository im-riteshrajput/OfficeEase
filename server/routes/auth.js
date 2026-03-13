import express from "express";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();


// REGISTER
router.post("/register", async (req, res) => {
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Employee({
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

        await user.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {

        console.error("REGISTER ERROR:", err);

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {

    console.log("LOGIN REQUEST BODY:", req.body);

    const { email, password } = req.body;

    const user = await Employee.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    console.log("Stored password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.dbRole },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {

    console.error("LOGIN ERROR:");
    console.error(err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

// STATUS CHECK (For Waiting Page Polling)
router.get("/status/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // 1. Check if user is still pending
    const PendingUser = (await import('../models/PendingUser.js')).default;
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      return res.json({ status: "pending" });
    }

    // 2. Check if user is in an active collection (Approved)
    const Admin = (await import('../models/Employee.js')).Admin;
    const HR = (await import('../models/Employee.js')).HR;
    const standardEmployee = await Employee.findOne({ email });
    
    // Check other collections too
    let activeUser = standardEmployee;
    if (!activeUser && Admin) activeUser = await Admin.findOne({ email });
    if (!activeUser && HR) activeUser = await HR.findOne({ email });

    if (activeUser) {
      return res.json({ status: "approved" });
    }

    // 3. User not found anywhere (likely rejected and deleted from pending)
    return res.json({ status: "rejected" });

  } catch (err) {
    console.error("STATUS CHECK ERROR:", err);
    res.status(500).json({ message: "Server error checking status" });
  }
});

export default router;