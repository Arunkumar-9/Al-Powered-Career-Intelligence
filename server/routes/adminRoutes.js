import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import { adminLogin, getAdminSession } from "../controllers/adminAuthController.js";
import { getDashboardStats } from "../controllers/adminDashboardController.js";
import {
  listUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../controllers/adminUserController.js";
import { listResumes, getResumeDetail, getResumeParsingStats } from "../controllers/adminResumeController.js";
import {
  listJobDescriptions,
  getJobDescriptionDetail,
  deleteJobDescriptionAdmin,
} from "../controllers/adminJobController.js";
import {
  getAtsAnalytics,
  getSkillGapAnalytics,
  getCareerAnalytics,
} from "../controllers/adminAnalyticsController.js";
import {
  listProfiles, getProfileAdmin, listFeedback, updateFeedback,
  createCourse, listCourses, updateCourse, deleteCourse, listActivity,
  getSystemStatus, getNotifications, getReports, getJobRecommendationAnalytics,
  exportUsersCsv, adminViewResume, adminDownloadResume, getJobSearchActivity,
} from "../controllers/adminExtendedController.js";

const router = express.Router();

// ---- Auth (public) ----
router.post("/auth/login", adminLogin);

// Everything below requires: valid token (authMiddleware) AND role
// === "admin" (adminMiddleware). Both checks happen on the backend,
// so these cannot be reached by a normal user's token regardless of
// what the frontend shows or hides.
router.use(authMiddleware, adminMiddleware);

router.get("/auth/me", getAdminSession);

// ---- Dashboard overview (Module 2) ----
router.get("/dashboard/stats", getDashboardStats);

// ---- User management (Module 3) ----
router.get("/users", listUsers);
router.get("/users/export.csv", exportUsersCsv);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// ---- Resume management & parsing monitoring (Modules 5 & 6) ----
router.get("/resumes", listResumes);
router.get("/resumes/:id", getResumeDetail);
router.get("/resumes/:id/view", adminViewResume);
router.get("/resumes/:id/download", adminDownloadResume);
router.get("/resume-parsing/stats", getResumeParsingStats);

// ---- Job description management (Module 7) ----
router.get("/jobs", listJobDescriptions);
router.get("/jobs/:id", getJobDescriptionDetail);
router.delete("/jobs/:id", deleteJobDescriptionAdmin);

// ---- Analytics: ATS, skill gap, career recommendations (Modules 8, 9, 10) ----
router.get("/analytics/ats", getAtsAnalytics);
router.get("/analytics/skill-gap", getSkillGapAnalytics);
router.get("/analytics/careers", getCareerAnalytics);
router.get("/analytics/job-recommendations", getJobRecommendationAnalytics);

// Profiles
router.get("/profiles", listProfiles);
router.get("/profiles/:id", getProfileAdmin);

// Courses & certifications catalog
router.get("/courses", listCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Feedback
router.get("/feedback", listFeedback);
router.patch("/feedback/:id", updateFeedback);

// Platform activity / operations
router.get("/activity", listActivity);
router.get("/activity/job-searches", getJobSearchActivity);
router.get("/system", getSystemStatus);
router.get("/notifications", getNotifications);
router.get("/reports", getReports);

export default router;
