import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", authMiddleware, getReport);

export default router;