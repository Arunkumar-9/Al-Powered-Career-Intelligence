import AnalysisReport from "../models/AnalysisReport.js";
import CareerRecommendation from "../models/CareerRecommendation.js";

// GET /api/admin/analytics/ats
// Average/highest/lowest ATS score, a bucketed score distribution,
// score trend over the last 30 days, and the most common missing
// keywords/skills across all analyses — all from AnalysisReport.
export const getAtsAnalytics = async (req, res) => {
  try {
    const [summary, distribution, missingKeywords, missingSkills, trend] = await Promise.all([
      AnalysisReport.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: "$atsScore" },
            highest: { $max: "$atsScore" },
            lowest: { $min: "$atsScore" },
            count: { $sum: 1 },
          },
        },
      ]),
      AnalysisReport.aggregate([
        {
          $bucket: {
            groupBy: "$atsScore",
            boundaries: [0, 20, 40, 60, 80, 101],
            default: "unscored",
            output: { count: { $sum: 1 } },
          },
        },
      ]),
      AnalysisReport.aggregate([
        { $unwind: "$missingKeywords" },
        { $group: { _id: "$missingKeywords", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AnalysisReport.aggregate([
        { $unwind: "$missingSkills" },
        { $group: { _id: "$missingSkills", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AnalysisReport.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            averageScore: { $avg: "$atsScore" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const labelForBucket = { 0: "0-19", 20: "20-39", 40: "40-59", 60: "60-79", 80: "80-100" };

    res.status(200).json({
      summary: summary[0]
        ? {
            average: Math.round(summary[0].average),
            highest: summary[0].highest,
            lowest: summary[0].lowest,
            totalAnalyses: summary[0].count,
          }
        : { average: 0, highest: 0, lowest: 0, totalAnalyses: 0 },
      distribution: distribution.map((b) => ({
        range: labelForBucket[b._id] ?? String(b._id),
        count: b.count,
      })),
      topMissingKeywords: missingKeywords.map((k) => ({ keyword: k._id, count: k.count })),
      topMissingSkills: missingSkills.map((s) => ({ skill: s._id, count: s.count })),
      trend: trend.map((t) => ({ date: t._id, averageScore: Math.round(t.averageScore), count: t.count })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/analytics/skill-gap
// Most commonly missing skills and most common matching (already-had)
// skills across all users' analyses — a real, aggregate view of
// platform-wide skill gaps, computed from AnalysisReport.
export const getSkillGapAnalytics = async (req, res) => {
  try {
    const [missingSkills, matchingSkills, recommendedSkills] = await Promise.all([
      AnalysisReport.aggregate([
        { $unwind: "$missingSkills" },
        { $group: { _id: "$missingSkills", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      AnalysisReport.aggregate([
        { $unwind: "$matchingSkills" },
        { $group: { _id: "$matchingSkills", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      AnalysisReport.aggregate([
        { $unwind: "$recommendedSkills" },
        { $group: { _id: "$recommendedSkills", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
    ]);

    res.status(200).json({
      mostMissingSkills: missingSkills.map((s) => ({ skill: s._id, count: s.count })),
      mostCommonMatchingSkills: matchingSkills.map((s) => ({ skill: s._id, count: s.count })),
      mostRecommendedSkills: recommendedSkills.map((s) => ({ skill: s._id, count: s.count })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/analytics/careers
// Most-recommended career roles and average compatibility, computed
// by unwinding every stored CareerRecommendation batch.
export const getCareerAnalytics = async (req, res) => {
  try {
    const [topRoles, totalBatches] = await Promise.all([
      CareerRecommendation.aggregate([
        { $unwind: "$recommendations" },
        {
          $group: {
            _id: "$recommendations.role",
            count: { $sum: 1 },
            avgCompatibility: { $avg: "$recommendations.compatibility" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      CareerRecommendation.countDocuments(),
    ]);

    res.status(200).json({
      totalRecommendationBatches: totalBatches,
      topRecommendedRoles: topRoles.map((r) => ({
        role: r._id,
        timesRecommended: r.count,
        averageCompatibility: Math.round(r.avgCompatibility),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
