import mongoose from "mongoose";

// Module 3: Career Recommendation
const careerItemSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    compatibility: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    requiredSkills: { type: [String], default: [] },
    roadmap: { type: [String], default: [] },
  },
  { _id: false }
);

const careerRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },

    contentHash: {
      type: String,
      index: true,
    },

    recommendations: {
      type: [careerItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

careerRecommendationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CareerRecommendation", careerRecommendationSchema);
