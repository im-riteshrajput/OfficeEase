import express from "express";
import { register, login, checkStatus, changePassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/status/:email", checkStatus);
router.put("/change-password", verifyToken, changePassword);

export default router;