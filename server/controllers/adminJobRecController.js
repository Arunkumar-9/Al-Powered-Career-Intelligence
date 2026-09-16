import JobSearchLog from "../models/JobSearchLog.js";

// Module 11: Job Recommendation Analytics, backed by JobSearchLog
// (see that model's comment). Only reflects searches made AFTER this
// logging went live — historical Adzuna results were never stored, so
// there is genuinely no way to backfill data from before this change.

// GET /api/admin/analytics/job-recommendations
export const getJobRecommendationAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalSearches, uniqueSearchers, topTitles, topCompanies, trend, avgResults] = await Promise.all([
      JobSearchLog.countDocuments(),
      JobSearchLog.distinct("userId"),
      JobSearchLog.aggregate([
        { $unwind: "$topJobTitles" },
        { $group: { _id: "$topJobTitles", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      JobSearchLog.aggregate([
        { $unwind: "$topCompanies" },
        { $group: { _id: "$topCompanies", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      JobSearchLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            searches: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      JobSearchLog.aggregate([{ $group: { _id: null, avg: { $avg: "$resultCount" } } }]),
    ]);

    res.status(200).json({
      totalSearches,
      uniqueSearchers: uniqueSearchers.length,
      averageResultsPerSearch: avgResults[0] ? Math.round(avgResults[0].avg) : 0,
      mostRecommendedJobTitles: topTitles.map((t) => ({ title: t._id, count: t.count })),
      mostRecommendedCompanies: topCompanies.map((c) => ({ company: c._id, count: c.count })),
      searchTrend: trend.map((t) => ({ date: t._id, searches: t.searches })),
      note:
        totalSearches === 0
          ? "No job searches logged yet — this data starts accumulating from real user job searches going forward."
          : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
