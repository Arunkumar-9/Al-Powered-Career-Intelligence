import mongoose from "mongoose";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Feedback from "../models/Feedback.js";
import { isAdzunaConfigured } from "../services/jobRecommendationService.js";

// Module 17: Notifications & Alerts.
//
// No stored "Notification" collection — alerts are computed live from
// real, current conditions each time this is called (failed resume
// parses, new users, unresolved feedback, service configuration, DB
// health). This keeps the data always accurate and avoids the spam
// problem of a stored/unread notification table nobody clears out.

// GET /api/admin/notifications
export const getNotifications = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [failedResumes, newUsers, unresolvedFeedback, unratedFeedback] = await Promise.all([
      Resume.countDocuments({ analysisStatus: "Pending", createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Feedback.countDocuments({ status: "new" }),
      Feedback.countDocuments({ status: "new", rating: { $lte: 2 } }),
    ]);

    const alerts = [];

    if (mongoose.connection.readyState !== 1) {
      alerts.push({
        severity: "critical",
        type: "system",
        message: "Database connection is not healthy.",
        timestamp: new Date(),
      });
    }

    if (!isAdzunaConfigured()) {
      alerts.push({
        severity: "warning",
        type: "system",
        message: "Job Recommendation service (Adzuna) is not configured — job search is unavailable to users.",
        timestamp: new Date(),
      });
    }

    if (failedResumes > 0) {
      alerts.push({
        severity: "warning",
        type: "resume_parsing",
        message: `${failedResumes} resume${failedResumes === 1 ? "" : "s"} stuck in "Pending" for over an hour — possible parsing failure.`,
        timestamp: new Date(),
      });
    }

    if (unratedFeedback > 0) {
      alerts.push({
        severity: "warning",
        type: "feedback",
        message: `${unratedFeedback} low-rated (≤2 stars) feedback submission${unratedFeedback === 1 ? "" : "s"} awaiting review.`,
        timestamp: new Date(),
      });
    }

    if (unresolvedFeedback > 0) {
      alerts.push({
        severity: "info",
        type: "feedback",
        message: `${unresolvedFeedback} new feedback submission${unresolvedFeedback === 1 ? "" : "s"} awaiting review.`,
        timestamp: new Date(),
      });
    }

    if (newUsers > 0) {
      alerts.push({
        severity: "info",
        type: "users",
        message: `${newUsers} new user${newUsers === 1 ? "" : "s"} registered in the last 24 hours.`,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      alerts,
      counts: { critical: alerts.filter((a) => a.severity === "critical").length, warning: alerts.filter((a) => a.severity === "warning").length, info: alerts.filter((a) => a.severity === "info").length },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
