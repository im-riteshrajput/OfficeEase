import express from "express";
import { clockIn, clockOut, getMyLogs, getMyStats, getAllLogs, getTeamStats, getEmployeeHistory, exportAttendanceCSV } from "../controllers/attendanceController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee routes
router.post("/clock-in", verifyToken, clockIn);
router.post("/clock-out", verifyToken, clockOut);
router.get("/me", verifyToken, getMyLogs);
router.get("/my-stats", verifyToken, getMyStats);

// Admin / HR only routes
router.get("/all", verifyToken, authorize(["Admin", "Human Resources"]), getAllLogs);
router.get("/team-stats", verifyToken, authorize(["Admin", "Human Resources"]), getTeamStats);
router.get("/employee/:employeeId", verifyToken, authorize(["Admin", "Human Resources"]), getEmployeeHistory);
router.get("/export", verifyToken, authorize(["Admin", "Human Resources"]), exportAttendanceCSV);

export default router;
