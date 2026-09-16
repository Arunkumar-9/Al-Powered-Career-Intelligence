import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addJobDescription,
  listJobDescriptions,
  getJobDescription,
  deleteJobDescription,
} from "../controllers/jobDescriptionController.js";

const router = express.Router();

router.post("/", authMiddleware, addJobDescription);
router.get("/", authMiddleware, listJobDescriptions);
router.get("/:id", authMiddleware, getJobDescription);
router.delete("/:id", authMiddleware, deleteJobDescription);

export default router;
