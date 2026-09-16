import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  analyzeResumeAgainstJD,
  getLatestAnalysis,
  getAnalysisHistory,
} from "../controllers/atsController.js";

const router = express.Router();

router.post("/analyze", authMiddleware, analyzeResumeAgainstJD);
router.get("/latest", authMiddleware, getLatestAnalysis);
router.get("/history", authMiddleware, getAnalysisHistory);

export default router;
