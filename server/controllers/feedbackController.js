import Feedback from "../models/Feedback.js";

export const createFeedback = async (req, res) => {
  try {
    const { rating, comment, category } = req.body;
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !String(comment || "").trim()) {
      return res.status(400).json({ message: "Rating (1-5) and comment are required" });
    }
    const feedback = await Feedback.create({ userId: req.user.id, rating: Number(rating), comment: String(comment).trim(), category: category || "General" });
    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (error) { res.status(500).json({ message: "Failed to submit feedback" }); }
};

export const getMyFeedback = async (req, res) => {
  try { res.json(await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10)); }
  catch { res.status(500).json({ message: "Failed to load feedback" }); }
};
