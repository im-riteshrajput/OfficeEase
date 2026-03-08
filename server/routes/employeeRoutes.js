import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

router.get("/", async (req, res) => {

  const employees = await Employee.find();
  res.json(employees);
});

router.post("/", async (req, res) => {
  const newUser = new Employee(req.body);
  const savedUser = await newUser.save();
  res.status(201).json(savedUser);
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
