import CourseRecommendation from "../models/CourseRecommendation.js";

// Module 12: Course & Certification Management.
//
// There is no standalone "course catalog" collection in this
// architecture — courses are generated per-user by
// courseRecommendationService and cached in CourseRecommendation
// batches (one document per unique missing-skills set). So instead of
// a CRUD catalog, this admin view aggregates every course that has
// ever been recommended, across all users, into a de-duplicated list
// with real usage counts. Because these records are AI/service
// generated rather than admin-authored, add/edit/delete of individual
// courses isn't supported by the current architecture (see the
// delivery notes) — admins can search/filter/inspect real data.

// GET /api/admin/courses?search=&platform=&page=&limit=
export const listCourses = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);
    const { search, platform } = req.query;

    const match = {};
    if (platform) match["courses.platform"] = platform;
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      match.$or = [{ "courses.title": regex }, { "courses.skill": regex }];
    }

    const pipeline = [
      { $unwind: "$courses" },
      ...(platform ? [{ $match: { "courses.platform": platform } }] : []),
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "courses.title": new RegExp(search.trim(), "i") },
                  { "courses.skill": new RegExp(search.trim(), "i") },
                ],
              },
            },
          ]
        : []),
      {
        $group: {
          _id: { title: "$courses.title", platform: "$courses.platform" },
          title: { $first: "$courses.title" },
          platform: { $first: "$courses.platform" },
          difficulty: { $first: "$courses.difficulty" },
          duration: { $first: "$courses.duration" },
          rating: { $first: "$courses.rating" },
          url: { $first: "$courses.url" },
          skills: { $addToSet: "$courses.skill" },
          timesRecommended: { $sum: 1 },
          lastRecommendedAt: { $max: "$createdAt" },
        },
      },
      { $sort: { timesRecommended: -1 } },
    ];

    const [rows, platformsAgg, totalSkillGaps] = await Promise.all([
      CourseRecommendation.aggregate(pipeline),
      CourseRecommendation.aggregate([
        { $unwind: "$courses" },
        { $group: { _id: "$courses.platform" } },
      ]),
      CourseRecommendation.countDocuments(),
    ]);

    const total = rows.length;
    const start = (page - 1) * limit;
    const pageRows = rows.slice(start, start + limit);

    res.status(200).json({
      courses: pageRows,
      platforms: platformsAgg.map((p) => p._id).filter(Boolean),
      totalRecommendationBatches: totalSkillGaps,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/courses/stats
export const getCourseStats = async (req, res) => {
  try {
    const [byPlatform, bySkill, totalBatches] = await Promise.all([
      CourseRecommendation.aggregate([
        { $unwind: "$courses" },
        { $group: { _id: "$courses.platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      CourseRecommendation.aggregate([
        { $unwind: "$courses" },
        { $group: { _id: "$courses.skill", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      CourseRecommendation.countDocuments(),
    ]);

    res.status(200).json({
      totalRecommendationBatches: totalBatches,
      byPlatform: byPlatform.map((p) => ({ platform: p._id || "Unknown", count: p.count })),
      topSkillsCovered: bySkill.map((s) => ({ skill: s._id, count: s.count })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
