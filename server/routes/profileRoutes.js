import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/", authMiddleware, createProfile);

router.get("/", authMiddleware, getProfile);

router.put("/", authMiddleware, updateProfile);

export default router;