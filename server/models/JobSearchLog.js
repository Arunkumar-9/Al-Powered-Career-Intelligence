import mongoose from "mongoose";

const jobSearchLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  query: { type: String, default: "" },
  location: { type: String, default: "" },
  jobType: { type: String, default: "" },
  sortBy: { type: String, default: "relevance" },
  resultCount: { type: Number, default: 0 },
  jobs: [{
    externalId: String,
    title: String,
    company: String,
    matchPercentage: Number,
  }],
}, { timestamps: true });

jobSearchLogSchema.index({ createdAt: -1 });
jobSearchLogSchema.index({ query: 1, createdAt: -1 });

export default mongoose.model("JobSearchLog", jobSearchLogSchema);
