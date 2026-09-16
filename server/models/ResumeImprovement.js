import mongoose from "mongoose";

// Module 6: Resume Improvement suggestions
const resumeImprovementSchema = new mongoose.Schema(
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

    summary: {
      before: { type: String, default: "" },
      after: { type: String, default: "" },
    },

    missingKeywords: { type: [String], default: [] },

    projectImprovements: {
      type: [{ before: String, after: String }],
      default: [],
    },

    certificationSuggestions: { type: [String], default: [] },

    technicalSkillImprovements: { type: [String], default: [] },

    formattingSuggestions: { type: [String], default: [] },

    grammarSuggestions: {
      type: [{ before: String, after: String }],
      default: [],
    },

    atsOptimizationTips: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

resumeImprovementSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ResumeImprovement", resumeImprovementSchema);
