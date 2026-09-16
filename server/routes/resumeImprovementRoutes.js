import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  generateImprovements,
  getLatestImprovement,
} from "../controllers/resumeImprovementController.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateImprovements);
router.get("/latest", authMiddleware, getLatestImprovement);

export default router;
