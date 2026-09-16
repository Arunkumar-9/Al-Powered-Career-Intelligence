import User from "../models/User.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import CareerRecommendation from "../models/CareerRecommendation.js";
import CourseRecommendation from "../models/CourseRecommendation.js";
import JobSearchLog from "../models/JobSearchLog.js";
import Profile from "../models/Profile.js";

// Module 14: Platform Usage & Activity Monitoring.
//
// Rather than adding a new ActivityLog collection + wiring an event
// write into every existing controller (registration, resume upload,
// analysis, job search, profile update, course recs...) — which would
// touch a lot of working, previously-shipped code — this derives a
// real, timestamped activity feed directly from the timestamps every
// one of those actions ALREADY leaves behind in its own collection.
// It's assembled the same way adminDashboardController's
// "recentActivity" is, just paginated/filterable and pulling from
// every action type instead of just three.
const EVENT_SOURCES = [
  { type: "user_registered", model: User, dateField: "createdAt", userField: "_id", build: (d) => `${d.name} registered` },
  { type: "user_login", model: User, dateField: "lastLoginAt", userField: "_id", build: (d) => `${d.name} logged in`, requireField: "lastLoginAt" },
  { type: "profile_updated", model: Profile, dateField: "updatedAt", userField: "userId", build: () => "Profile updated" },
  { type: "resume_uploaded", model: Resume, dateField: "createdAt", userField: "userId", build: (d) => `Resume "${d.originalName}" uploaded` },
  { type: "resume_analyzed", model: AnalysisReport, dateField: "createdAt", userField: "userId", build: (d) => `Resume analyzed — ATS score ${d.atsScore}${d.jobTitle ? ` for "${d.jobTitle}"` : ""}` },
  { type: "career_recommendation", model: CareerRecommendation, dateField: "createdAt", userField: "userId", build: () => "Career recommendations generated" },
  { type: "course_recommendation", model: CourseRecommendation, dateField: "createdAt", userField: "userId", build: () => "Course recommendations generated" },
  { type: "job_search", model: JobSearchLog, dateField: "createdAt", userField: "userId", build: (d) => `Job search: "${d.query || d.location || "general"}" (${d.resultCount} results)` },
];

// GET /api/admin/activity?type=&page=&limit=&from=&to=
export const listActivity = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const { type, from, to } = req.query;

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const sources = type ? EVENT_SOURCES.filter((s) => s.type === type) : EVENT_SOURCES;

    // Pull a generous, recent window from every relevant collection,
    // merge, sort, then paginate in memory. Each source is capped so
    // this stays fast even with a large dataset, without needing a
    // dedicated activity-log table.
    const PER_SOURCE_CAP = 200;

    const results = await Promise.all(
      sources.map(async (source) => {
        const filter = { ...dateFilter };
        if (source.requireField) filter[source.requireField] = { ...(filter[source.requireField] || {}), $ne: null };
        if (Object.keys(dateFilter).length) filter[source.dateField] = dateFilter;

        let query = source.model.find(filter).sort({ [source.dateField]: -1 }).limit(PER_SOURCE_CAP);
        if (source.userField !== "_id") {
          query = query.populate(source.userField, "name email");
        }
        const docs = await query;

        return docs.map((d) => ({
          type: source.type,
          message: source.build(d),
          user:
            source.userField === "_id"
              ? { name: d.name, email: d.email }
              : d[source.userField]
              ? { name: d[source.userField].name, email: d[source.userField].email }
              : null,
          timestamp: d[source.dateField],
        }));
      })
    );

    const merged = results
      .flat()
      .filter((e) => e.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = merged.length;
    const start = (page - 1) * limit;
    const pageItems = merged.slice(start, start + limit);

    res.status(200).json({
      activity: pageItems,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
      availableTypes: EVENT_SOURCES.map((s) => s.type),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/activity/summary — counts per event type in the last 7/30 days
export const getActivitySummary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const counts = await Promise.all(
      EVENT_SOURCES.map(async (source) => {
        const baseFilter = source.requireField ? { [source.requireField]: { $ne: null } } : {};
        const [last7, last30] = await Promise.all([
          source.model.countDocuments({ ...baseFilter, [source.dateField]: { $gte: sevenDaysAgo } }),
          source.model.countDocuments({ ...baseFilter, [source.dateField]: { $gte: thirtyDaysAgo } }),
        ]);
        return { type: source.type, last7Days: last7, last30Days: last30 };
      })
    );

    res.status(200).json({ summary: counts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
