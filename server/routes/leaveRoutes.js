import express from "express";
import { applyLeave, getMyLeaves, getLeaveBalanceEndpoint, getAllLeaveRequests, reviewLeave } from "../controllers/leaveController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee routes
router.post("/apply", verifyToken, applyLeave);
router.get("/me", verifyToken, getMyLeaves);
router.get("/balance", verifyToken, getLeaveBalanceEndpoint);

// Admin / HR only routes
router.get("/all", verifyToken, authorize(["Admin", "Human Resources"]), getAllLeaveRequests);
router.put("/:id/review", verifyToken, authorize(["Admin", "Human Resources"]), reviewLeave);

export default router;
