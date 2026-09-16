import mongoose from "mongoose";

// Combined ATS Resume Analysis (Module 1) + Skill Gap Analysis (Module 2)
// report. Both are produced from a single AI comparison of resume vs JD,
// so they are stored together to avoid duplicate AI calls and reads.
const analysisReportSchema = new mongoose.Schema(
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

    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
      default: null,
    },

    jobTitle: {
      type: String,
      default: "",
    },

    // Content hash of (resumeText + jdText) used to serve cached results
    // instead of re-calling the AI for an identical comparison.
    contentHash: {
      type: String,
      index: true,
    },

    // ---------------- Module 1: ATS Resume Analysis ----------------
    atsScore: {
      type: Number,
      default: 0,
    },

    matchPercentage: {
      type: Number,
      default: 0,
    },

    keywordMatchPercentage: {
      type: Number,
      default: 0,
    },

    overallStatus: {
      type: String,
      enum: ["Excellent Match", "Good Match", "Average Match", "Poor Match"],
      default: "Average Match",
    },

    matchingKeywords: {
      type: [String],
      default: [],
    },

    missingKeywords: {
      type: [String],
      default: [],
    },

    importantMissingTechnologies: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    // ---------------- Module 2: Skill Gap Analysis ----------------
    matchingSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    recommendedSkills: {
      type: [String],
      default: [],
    },

    skillMatchPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

analysisReportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("AnalysisReport", analysisReportSchema);
