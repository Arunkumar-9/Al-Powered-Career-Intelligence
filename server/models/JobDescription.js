import mongoose from "mongoose";

// Saved Job Description library (Module 1 & 2 input).
// Users can paste a JD on the fly (not saved) or save it here for reuse.
const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      default: "",
      trim: true,
    },

    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("JobDescription", jobDescriptionSchema);
