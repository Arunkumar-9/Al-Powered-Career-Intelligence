import mongoose from "mongoose";

// Module 5: Course Recommendation (cached per missing-skills set)
const courseItemSchema = new mongoose.Schema(
  {
    title: String,
    platform: String,
    difficulty: String,
    duration: String,
    rating: Number,
    url: String,
    skill: String,
  },
  { _id: false }
);

const courseRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    missingSkillsHash: {
      type: String,
      index: true,
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    courses: {
      type: [courseItemSchema],
      default: [],
    },

    learningPath: {
      type: [
        {
          step: Number,
          skill: String,
          description: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

courseRecommendationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CourseRecommendation", courseRecommendationSchema);
