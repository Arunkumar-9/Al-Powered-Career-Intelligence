import express from "express";

import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  uploadResume,
  getResume,
  deleteResume,
  getResumeHistory,
  viewResumeVersion,
  downloadResumeVersion,
  deleteResumeVersion,
  activateResumeVersion,
} from "../controllers/resumeController.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.get(
  "/",
  authMiddleware,
  getResume
);

router.delete(
  "/",
  authMiddleware,
  deleteResume
);

// ---- Resume History feature ----
router.get(
  "/history",
  authMiddleware,
  getResumeHistory
);

router.get(
  "/history/:id/view",
  authMiddleware,
  viewResumeVersion
);

router.get(
  "/history/:id/download",
  authMiddleware,
  downloadResumeVersion
);

router.delete(
  "/history/:id",
  authMiddleware,
  deleteResumeVersion
);

router.patch(
  "/history/:id/activate",
  authMiddleware,
  activateResumeVersion
);

export default router;
