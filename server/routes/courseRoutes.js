import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCourseRecommendations } from "../controllers/courseController.js";

const router = express.Router();

router.get("/recommend", authMiddleware, getCourseRecommendations);

export default router;
