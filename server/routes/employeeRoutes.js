import express from "express";
import { Admin, HR, Employee } from "../models/Employee.js";
import PendingUser from "../models/PendingUser.js";
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

// GET all pending users (Admin/HR only)
router.get("/pending", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find().sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    console.error("FETCH PENDING ERROR:", error);
    res.status(500).json({ message: "Error fetching pending users" });
  }
});

// PUT approve pending user (Admin/HR only)
router.put("/:id/approve", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  try {
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }

    // Determine target collection based on dbRole
    let Model;
    if (pendingUser.dbRole === 'Admin') Model = Admin;
    else if (pendingUser.dbRole === 'Human Resources') Model = HR;
    else Model = Employee;

    // Create in the actual collection
    const userData = pendingUser.toObject();
    delete userData._id;
    delete userData.__v;
    userData.estatus = "active";

    const newUser = new Model(userData);
    await newUser.save();

    // Delete from pending
    await PendingUser.findByIdAndDelete(req.params.id);

    res.json({ message: "User approved successfully", user: newUser });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({ message: "Error approving user" });
  }
});

// DELETE reject pending user (Admin/HR only)
router.delete("/:id/reject", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  try {
    const pendingUser = await PendingUser.findByIdAndDelete(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    res.json({ message: "Application rejected and deleted" });
  } catch (error) {
    console.error("REJECT ERROR:", error);
    res.status(500).json({ message: "Error rejecting user" });
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

  // Only Admin can change dbRole
  if (role !== 'Admin' && req.body.dbRole) {
      delete req.body.dbRole; // Forcefully remove dbRole from payload to prevent privilege escalation
  }

  try {
    let updateResult;

    // Check if dbRole is being changed by an Admin
    if (role === 'Admin' && req.body.dbRole) {
        // Find the user to check their current dbRole
        const [existingAdmin, existingHR, existingEmployee] = await Promise.all([
            Admin.findById(targetId),
            HR.findById(targetId),
            Employee.findById(targetId)
        ]);

        const existingUser = existingAdmin || existingHR || existingEmployee;

        if (!existingUser) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Check if role actually changed
        if (existingUser.dbRole !== req.body.dbRole) {
            // Determine the current collection model based on where it was found
            let CurrentModel = existingAdmin ? Admin : (existingHR ? HR : Employee);
            
            // Determine the new collection model based on the requested dbRole
            let NewModel;
            if (req.body.dbRole === 'Admin') NewModel = Admin;
            else if (req.body.dbRole === 'Human Resources') NewModel = HR;
            else NewModel = Employee;

            // Prepare the new document data, merging updates with existing data
            const newUserData = { ...existingUser.toObject(), ...req.body };
            
            // We shouldn't change the _id itself if we can help it, 
            // but creating a new document in a different collection allows maintaining the _id
            const migratedUser = new NewModel(newUserData);
            
            // Save to new collection
            updateResult = await migratedUser.save();
            
            // Delete from old collection
            await CurrentModel.findByIdAndDelete(targetId);

            return res.json({ message: "Role updated and user migrated successfully", user: updateResult });
        }
    }

    // Standard update if dbRole didn't change or if it's not being modified
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
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
