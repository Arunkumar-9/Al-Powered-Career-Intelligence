import Feedback from "../models/Feedback.js";

// GET /api/admin/feedback?search=&status=&category=&page=&limit=
export const listFeedback = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const { search, status, category } = req.query;

    const filter = {};
    if (status && ["new", "reviewed", "resolved"].includes(status)) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.message = new RegExp(search.trim(), "i");

    const [feedback, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email"),
      Feedback.countDocuments(filter),
    ]);

    res.status(200).json({
      feedback: feedback.map((f) => ({
        _id: f._id,
        user: f.userId ? { name: f.userId.name, email: f.userId.email } : null,
        category: f.category,
        rating: f.rating,
        message: f.message,
        status: f.status,
        createdAt: f.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/feedback/stats
export const getFeedbackStats = async (req, res) => {
  try {
    const [byStatus, byCategory, avgRatingAgg, total] = await Promise.all([
      Feedback.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Feedback.aggregate([
        { $match: { rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
      Feedback.countDocuments(),
    ]);

    res.status(200).json({
      total,
      averageRating: avgRatingAgg[0] ? Math.round(avgRatingAgg[0].avg * 10) / 10 : null,
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/feedback/:id/status  { status: "new" | "reviewed" | "resolved" }
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "status must be new, reviewed, or resolved" });
    }

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    res.status(200).json({ message: "Feedback status updated", feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/feedback/:id
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    res.status(200).json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
