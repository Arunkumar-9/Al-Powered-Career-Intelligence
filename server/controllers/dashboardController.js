import Profile from "../models/Profile.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import CareerRecommendation from "../models/CareerRecommendation.js";
import CourseRecommendation from "../models/CourseRecommendation.js";
import ResumeImprovement from "../models/ResumeImprovement.js";
import JobSearchLog from "../models/JobSearchLog.js";
import ActivityLog from "../models/ActivityLog.js";

const PROFILE_FIELDS = [
  "phone", "college", "degree", "branch", "graduationYear",
  "cgpa", "skills", "interests", "careerGoal", "preferredRole",
  "experience", "location",
];

export const computeProfileCompletion = (profile) => {
  if (!profile) return 0;

  const filled = PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  });

  return Math.round((filled.length / PROFILE_FIELDS.length) * 100);
};

// Resume History: users can pick any previous version as their
// "active" resume, so every module that needs "the" resume must
// resolve to whichever one is currently flagged active (falling back
// to the most recent upload for any legacy data that predates the
// isActive field).
const getActiveResume = async (userId) => {
  const active = await Resume.findOne({ userId, isActive: true });
  if (active) return active;

  return Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });
};

// GET /api/dashboard/summary
// Module 7: Career Dashboard aggregation — pulls together the output
// of every other module into one lightweight payload for the
// dashboard cards/charts, without duplicating any AI calls.
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [profile, resume] = await Promise.all([
      Profile.findOne({ userId }),
      // Resume History: use whichever version is currently active.
      getActiveResume(userId),
    ]);

    // Resume-based reports (ATS score, career recommendations) must
    // reflect the ACTIVE resume specifically, not just "whatever was
    // analyzed most recently" — which could belong to an older,
    // now-inactive version if the user has since switched.
    const [latestAnalysis, latestCareer, latestCourses, latestImprovement, latestJobSearch, recentActivity] = await Promise.all([
      resume
        ? AnalysisReport.findOne({ userId, resumeId: resume._id }).sort({ createdAt: -1 })
        : null,
      resume
        ? CareerRecommendation.findOne({ userId, resumeId: resume._id }).sort({ createdAt: -1 })
        : null,
      CourseRecommendation.findOne({ userId }).sort({ createdAt: -1 }),
      resume
        ? ResumeImprovement.findOne({ userId, resumeId: resume._id }).sort({ createdAt: -1 })
        : ResumeImprovement.findOne({ userId }).sort({ createdAt: -1 }),
      JobSearchLog.findOne({ userId }).sort({ createdAt: -1 }),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(6).select("type message createdAt"),
    ]);

    res.status(200).json({
      resumeStatus: resume ? resume.analysisStatus : "Not Uploaded",
      profileCompletion: computeProfileCompletion(profile),
      careerGoal: profile?.careerGoal || null,
      ats: latestAnalysis
        ? {
            atsScore: latestAnalysis.atsScore,
            matchPercentage: latestAnalysis.matchPercentage,
            overallStatus: latestAnalysis.overallStatus,
            matchingSkills: latestAnalysis.matchingSkills,
            missingSkills: latestAnalysis.missingSkills,
          }
        : null,
      recommendedCareers: latestCareer ? latestCareer.recommendations.slice(0, 3) : [],
      recommendedCourses: latestCourses ? latestCourses.courses.slice(0, 3) : [],
      resumeImprovement: latestImprovement
        ? {
            generatedAt: latestImprovement.createdAt,
            missingKeywords: latestImprovement.missingKeywords.slice(0, 6),
            tipsCount: latestImprovement.atsOptimizationTips.length
              + latestImprovement.formattingSuggestions.length
              + latestImprovement.technicalSkillImprovements.length,
          }
        : null,
      recommendedJobs: latestJobSearch ? latestJobSearch.jobs.slice(0, 3) : [],
      recentActivity: recentActivity.map((activity) => ({
        id: activity._id,
        type: activity.type,
        message: activity.message,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
