import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { searchJobsForUser } from "../controllers/jobController.js";

const router = express.Router();

router.get("/search", authMiddleware, searchJobsForUser);

export default router;
