import express from "express";
import { Admin, HR, Employee } from "../models/Employee.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all employees (Tiered Access)
router.get("/", verifyToken, async (req, res) => {
  const { role, id } = req.user;

  try {
    if (role === 'Admin') {
      const [admins, hr, staff] = await Promise.all([
        Admin.find(),
        HR.find(),
        Employee.find()
      ]);
      return res.json([...admins, ...hr, ...staff]);
    }

    if (role === 'Human Resources') {
      const [hr, staff] = await Promise.all([
        HR.find(),
        Employee.find()
      ]);
      return res.json([...hr, ...staff]);
    }

    // Standard Employee: Only see themselves
    const self = await Employee.findById(id);
    if (!self) {
        return res.status(404).json({ message: "Employee record not found" });
    }
    res.json([self]);

  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ message: "Error fetching segregated data" });
  }
});

// POST new employee (Admin/HR only)
router.post("/", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  const { dbRole } = req.body;
  
  let Model;
  if (dbRole === 'Admin') Model = Admin;
  else if (dbRole === 'Human Resources') Model = HR;
  else Model = Employee;

  try {
    const newUser = new Model(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE employee (Admin only)
router.delete("/:id", verifyToken, authorize(['Admin']), async (req, res) => {
  try {
    // We don't know which collection the user is in, so we try all
    const results = await Promise.allSettled([
      Admin.findByIdAndDelete(req.params.id),
      HR.findByIdAndDelete(req.params.id),
      Employee.findByIdAndDelete(req.params.id)
    ]);

    const deleted = results.find(r => r.status === 'fulfilled' && r.value);

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found or already deleted" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update employee (Admin/HR can update any they can see, Employee can update self)
router.put("/:id", verifyToken, async (req, res) => {
  const { role, id } = req.user;
  const targetId = req.params.id;

  // Authorization check
  if (role === 'Employee' && id !== targetId) {
    return res.status(403).json({ message: "Access denied: You can only update your own profile" });
  }

  // HR cannot update Admin
  if (role === 'Human Resources') {
     const isAdmin = await Admin.findById(targetId);
     if (isAdmin) {
         return res.status(403).json({ message: "Access denied: HR cannot modify Admin records" });
     }
  }

  try {
    let updateResult;
    // Try updating in all collections
    const [adminUpdate, hrUpdate, empUpdate] = await Promise.all([
      Admin.findByIdAndUpdate(targetId, req.body, { new: true }),
      HR.findByIdAndUpdate(targetId, req.body, { new: true }),
      Employee.findByIdAndUpdate(targetId, req.body, { new: true })
    ]);

    updateResult = adminUpdate || hrUpdate || empUpdate;

    if (!updateResult) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updateResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
