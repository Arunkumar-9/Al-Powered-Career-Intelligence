import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profile: {
      name: String,
      email: String,
      phone: String,
      degree: String,
      college: String,
      cgpa: String,
      skills: [String],
      projects: [String],
      certifications: [String],
      experience: [String],
    },

    resumeScore: Number,

    strengths: [String],

    weaknesses: [String],

    missingSkills: [String],

    careerRecommendations: [String],

    learningRoadmap: [
      {
        week: Number,
        topic: String,
        description: String,
      },
    ],

    interviewQuestions: [String],

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AIReport", aiReportSchema);