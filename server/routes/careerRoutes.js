import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getCareerRecommendations,
  getLatestCareerRecommendation,
} from "../controllers/careerController.js";

const router = express.Router();

router.post("/recommend", authMiddleware, getCareerRecommendations);
router.get("/latest", authMiddleware, getLatestCareerRecommendation);

export default router;
