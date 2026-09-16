import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    resumeScore: {
      type: Number,
      default: 0,
    },

    analysisStatus: {
      type: String,
      enum: ["Pending", "Processing", "Completed"],
      default: "Pending",
    },

    parsingStatus: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed"],
      default: "Pending",
      index: true,
    },
    parsingError: { type: String, default: "" },
    parsedAt: { type: Date, default: null },

    // ---- Resume History feature ----
    // Every upload now creates a NEW document instead of overwriting
    // the previous one. `version` is a per-user, auto-incrementing
    // counter (1, 2, 3, ...) reflecting upload order.
    //
    // `isActive` marks whichever ONE version the user currently wants
    // used across the app (ATS analysis, job applications, profile
    // usage, the main Resume page). It defaults to the most recently
    // uploaded version, but the user can switch it to any older
    // version at any time ("Set as Active" in Resume History) — so it
    // is intentionally independent of `version`/recency after that
    // point.
    version: {
      type: Number,
      required: true,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1, version: -1 });
resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Resume", resumeSchema);