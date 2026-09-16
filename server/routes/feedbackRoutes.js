import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createFeedback, getMyFeedback } from "../controllers/feedbackController.js";

const router = express.Router();
router.post("/", authMiddleware, createFeedback);
router.get("/mine", authMiddleware, getMyFeedback);
export default router;
