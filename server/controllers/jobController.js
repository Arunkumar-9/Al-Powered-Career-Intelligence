import Profile from "../models/Profile.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import { searchJobs, isAdzunaConfigured, buildLocalJobSuggestions } from "../services/jobRecommendationService.js";
import JobSearchLog from "../models/JobSearchLog.js";
import { logActivity } from "../utils/logActivity.js";

// Resume History: job matching should be enriched using the skill-gap
// analysis for whichever resume version is currently active, not
// just the most recent analysis ever run.
const getActiveResume = async (userId) => {
  const active = await Resume.findOne({ userId, isActive: true });
  if (active) return active;

  return Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });
};

// GET /api/jobs/search?query=&location=&jobType=&sortBy=&page=
// Module 4: Job Recommendation. Uses the user's profile skills plus
// the active resume's most recent skill-gap analysis (matching
// skills) to rank results, unless the user supplies their own query.
export const searchJobsForUser = async (req, res) => {
  try {
    const { query = "", location = "", jobType = "", sortBy = "relevance", page = 1 } =
      req.query;

    const profile = await Profile.findOne({ userId: req.user.id });
    const activeResume = await getActiveResume(req.user.id);
    const latestAnalysis = activeResume
      ? await AnalysisReport.findOne({
          userId: req.user.id,
          resumeId: activeResume._id,
        }).sort({ createdAt: -1 })
      : null;

    const skills = [
      ...(profile?.skills || []),
      ...(latestAnalysis?.matchingSkills || []),
    ];

    const searchParams = { skills, location: location || profile?.location || "", jobType, query, sortBy, page: Number(page) || 1 };
    let result;
    try {
      result = isAdzunaConfigured()
        ? await searchJobs(searchParams)
        : buildLocalJobSuggestions(searchParams);
    } catch (error) {
      console.error("Live job search unavailable; using local suggestions:", error.message);
      result = buildLocalJobSuggestions(searchParams);
    }

    await JobSearchLog.create({ userId: req.user.id, query, location: location || profile?.location || "", jobType, sortBy, resultCount: result.count || result.jobs?.length || 0, jobs: (result.jobs || []).slice(0, 20).map((job) => ({ externalId: String(job.id), title: job.title, company: job.company, matchPercentage: job.matchPercentage })) });
    logActivity({ userId: req.user.id, type: "job_search", message: `Job search: ${query || "recommended jobs"}`, metadata: { resultCount: result.count || result.jobs?.length || 0, location } });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
