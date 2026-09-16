import User from "../models/User.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import JobDescription from "../models/JobDescription.js";
import CareerRecommendation from "../models/CareerRecommendation.js";
import CourseRecommendation from "../models/CourseRecommendation.js";
import JobSearchLog from "../models/JobSearchLog.js";
import ActivityLog from "../models/ActivityLog.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// GET /api/admin/dashboard/stats
// All figures come straight from the existing collections — no mock
// values. Runs the independent counts in parallel for speed.
export const getDashboardStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);
    const thirtyDaysAgo = new Date(Date.now() - 30 * DAY_MS);

    const [
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalResumes,
      totalAnalyses,
      avgAtsScoreAgg,
      totalJobs,
      totalCareerRecs,
      totalCourseRecs,
      totalJobSearches,
      recentUsers,
      recentResumes,
      recentAnalyses,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Resume.countDocuments(),
      AnalysisReport.countDocuments(),
      AnalysisReport.aggregate([
        { $group: { _id: null, avg: { $avg: "$atsScore" } } },
      ]),
      JobDescription.countDocuments(),
      CareerRecommendation.countDocuments(),
      CourseRecommendation.countDocuments(),
      JobSearchLog.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt"),
      Resume.find().sort({ createdAt: -1 }).limit(5).select("userId originalName analysisStatus createdAt").populate("userId", "name email"),
      AnalysisReport.find().sort({ createdAt: -1 }).limit(5).select("userId atsScore jobTitle createdAt").populate("userId", "name email"),
    ]);

    // Recent platform activity: merge the last few users/resumes/
    // analyses into one timeline, newest first.
    const activity = [
      ...recentUsers.map((u) => ({
        type: "user_registered",
        message: `${u.name} registered`,
        timestamp: u.createdAt,
      })),
      ...recentResumes.map((r) => ({
        type: "resume_uploaded",
        message: `${r.userId?.name || "A user"} uploaded a resume (${r.analysisStatus})`,
        timestamp: r.createdAt,
      })),
      ...recentAnalyses.map((a) => ({
        type: "resume_analyzed",
        message: `${a.userId?.name || "A user"} got an ATS score of ${a.atsScore}${a.jobTitle ? ` for "${a.jobTitle}"` : ""}`,
        timestamp: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newThisWeek: newUsersThisWeek,
      },
      resumes: {
        total: totalResumes,
        totalAnalyses,
        averageAtsScore: avgAtsScoreAgg[0] ? Math.round(avgAtsScoreAgg[0].avg) : 0,
      },
      jobs: {
        total: totalJobs,
      },
      recommendations: {
        careerRecommendationBatches: totalCareerRecs,
        courseRecommendationBatches: totalCourseRecs,
      },
      jobRecommendations: { totalSearches: totalJobSearches },
      activityStats: { totalEvents: await ActivityLog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }) },
      recentActivity: activity,
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
