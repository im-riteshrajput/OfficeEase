import express from "express";
import { requestRegularization, getMyRegularizations, getAllRegularizations, reviewRegularization } from "../controllers/regularizationController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee routes
router.post("/request", verifyToken, requestRegularization);
router.get("/me", verifyToken, getMyRegularizations);

// Admin / HR only routes
router.get("/all", verifyToken, authorize(["Admin", "Human Resources"]), getAllRegularizations);
router.put("/:id/review", verifyToken, authorize(["Admin", "Human Resources"]), reviewRegularization);

export default router;
