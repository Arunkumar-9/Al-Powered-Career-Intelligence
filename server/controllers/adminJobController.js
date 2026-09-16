import JobDescription from "../models/JobDescription.js";
import AnalysisReport from "../models/AnalysisReport.js";

// Note: Job "recommendations" in this platform (Module 4 / Adzuna
// search results) are fetched live from an external API on each
// request and are never persisted — there is no JobRecommendation
// collection. So this controller manages the JobDescription library
// (JDs users have saved for ATS/skill-gap comparison), which IS real,
// stored data. See adminAnalyticsController's note on job
// recommendation analytics for why that module isn't built.

// GET /api/admin/jobs?search=&page=&limit=
export const listJobDescriptions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const { search } = req.query;

    const filter = {};
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { company: regex }];
    }

    const [jobs, total] = await Promise.all([
      JobDescription.find(filter)
        .select("userId title company createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email"),
      JobDescription.countDocuments(filter),
    ]);

    // How many times each JD was actually used in an analysis run.
    const jobIds = jobs.map((j) => j._id);
    const usageAgg = await AnalysisReport.aggregate([
      { $match: { jobDescriptionId: { $in: jobIds } } },
      { $group: { _id: "$jobDescriptionId", count: { $sum: 1 } } },
    ]);
    const usageMap = new Map(usageAgg.map((u) => [String(u._id), u.count]));

    res.status(200).json({
      jobs: jobs.map((j) => ({
        _id: j._id,
        title: j.title,
        company: j.company,
        createdAt: j.createdAt,
        user: j.userId ? { id: j.userId._id, name: j.userId.name, email: j.userId.email } : null,
        analysisUsageCount: usageMap.get(String(j._id)) || 0,
      })),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/jobs/:id
export const getJobDescriptionDetail = async (req, res) => {
  try {
    const jd = await JobDescription.findById(req.params.id).populate("userId", "name email");

    if (!jd) return res.status(404).json({ message: "Job description not found" });

    res.status(200).json({ job: jd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/jobs/:id
export const deleteJobDescriptionAdmin = async (req, res) => {
  try {
    const jd = await JobDescription.findByIdAndDelete(req.params.id);

    if (!jd) return res.status(404).json({ message: "Job description not found" });

    res.status(200).json({ message: "Job description deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
