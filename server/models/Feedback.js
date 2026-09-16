import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, required: true },
  category: { type: String, trim: true, default: "General" },
  status: { type: String, enum: ["new", "reviewed", "resolved"], default: "new", index: true },
  adminNote: { type: String, default: "" },
}, { timestamps: true });

feedbackSchema.index({ createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
