import express from "express";
import Task from "../models/Task.js";
import { Admin, HR, Employee } from "../models/Employee.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to find user by ID for profile photo
const findUserForTask = async (id) => {
  const [admin, hr, emp] = await Promise.all([
    Admin.findById(id).select("profilePhotoUrl employeeId"),
    HR.findById(id).select("profilePhotoUrl employeeId"),
    Employee.findById(id).select("profilePhotoUrl employeeId"),
  ]);
  return admin || hr || emp;
};

// Helper to enrich task assignees with profile photos
const enrichTasks = async (tasks) => {
  return Promise.all(tasks.map(async (task) => {
    const taskObj = task.toObject();
    taskObj.assignees = await Promise.all(
      (taskObj.assignees || []).map(async (a) => {
        const user = await findUserForTask(a.id);
        return { ...a, profilePhotoUrl: user?.profilePhotoUrl || null, employeeId: user?.employeeId || null };
      })
    );
    return taskObj;
  }));
};

// GET all tasks (Admin/HR only)
router.get("/", verifyToken, authorize(["Admin", "Human Resources"]), async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    const enriched = await enrichTasks(tasks);
    res.json(enriched);
  } catch (error) {
    console.error("FETCH TASKS ERROR:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// GET tasks for the logged-in employee
router.get("/my-tasks", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ "assignees.id": req.user.id }).sort({ createdAt: -1 });
    const enriched = await enrichTasks(tasks);
    res.json(enriched);
  } catch (error) {
    console.error("FETCH MY TASKS ERROR:", error);
    res.status(500).json({ message: "Error fetching your tasks" });
  }
});

// POST create/assign a new task (Admin/HR only) — supports single or multiple assignees
router.post("/", verifyToken, authorize(["Admin", "Human Resources"]), async (req, res) => {
  try {
    const { title, description, assignees, priority, dueDate } = req.body;
    // assignees is an array of { id, name }

    if (!assignees || assignees.length === 0) {
      return res.status(400).json({ message: "At least one assignee is required" });
    }

    // Look up the assigner's name from the DB
    const [admin, hr, emp] = await Promise.all([
      Admin.findById(req.user.id),
      HR.findById(req.user.id),
      Employee.findById(req.user.id)
    ]);
    const assigner = admin || hr || emp;

    const newTask = new Task({
      title,
      description,
      assignees: assignees.map(a => ({ id: a.id, name: a.name })),
      assignedBy: req.user.id,
      assignedByName: assigner?.name || "Admin",
      priority,
      dueDate,
      status: "Pending"
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: "Error creating task" });
  }
});

// PUT accept a task (Employee sets status to "In Progress")
router.put("/:id/accept", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only the assigned employee can accept
    const isAssignee = task.assignees.some(a => a.id.toString() === req.user.id);
    if (!isAssignee) {
      return res.status(403).json({ message: "You can only accept tasks assigned to you" });
    }

    if (task.status !== "Pending") {
      return res.status(400).json({ message: "Only pending tasks can be accepted" });
    }

    task.status = "In Progress";
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    console.error("ACCEPT TASK ERROR:", error);
    res.status(500).json({ message: "Error accepting task" });
  }
});

// PUT complete a task (Employee sets status to "Completed")
router.put("/:id/complete", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only the assigned employee can complete
    const isAssignee = task.assignees.some(a => a.id.toString() === req.user.id);
    if (!isAssignee) {
      return res.status(403).json({ message: "You can only complete tasks assigned to you" });
    }

    if (task.status !== "In Progress") {
      return res.status(400).json({ message: "Only in-progress tasks can be completed" });
    }

    task.status = "Completed";
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    console.error("COMPLETE TASK ERROR:", error);
    res.status(500).json({ message: "Error completing task" });
  }
});

// DELETE a task (Admin/HR only)
router.delete("/:id", verifyToken, authorize(["Admin", "Human Resources"]), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

export default router;
