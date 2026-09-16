import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  resourceType: { type: String, enum: ["course", "certification"], default: "course", index: true },
  title: { type: String, required: true, trim: true },
  provider: { type: String, required: true, trim: true },
  category: { type: String, default: "General", trim: true },
  skill: { type: String, default: "", trim: true },
  difficulty: { type: String, default: "Beginner", trim: true },
  duration: { type: String, default: "" },
  url: { type: String, default: "" },
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

courseSchema.index({ title: "text", provider: "text", category: "text", skill: "text" });
courseSchema.index({ createdAt: -1 });

export default mongoose.model("Course", courseSchema);
