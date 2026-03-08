import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const employeeExist = await Employee.findOne({ email });

    if (employeeExist) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = new Employee({
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
    res.status(500).json(error);
  }
};


// LOGIN
const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });

    if (!employee)
      return res.status(400).json({ message: "Invalid email" });

    const validPassword = await bcrypt.compare(password, employee.password);

    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: employee._id, role: employee.dbRole },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      employee
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json(error);
  }
};

export { register, login };