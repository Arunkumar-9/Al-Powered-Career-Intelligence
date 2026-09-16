import Resume from "../models/Resume.js";
import Profile from "../models/Profile.js";
import AnalysisReport from "../models/AnalysisReport.js";
import CourseRecommendation from "../models/CourseRecommendation.js";
import { recommendCoursesForSkills } from "../services/courseRecommendationService.js";
import { hashContent } from "../utils/hash.js";
import { logActivity } from "../utils/logActivity.js";
import { normalizeSkillList } from "../utils/skillSynonyms.js";

// Used only when a user has not run a tailored Skill Gap analysis yet.
// These are broadly useful, marketable foundations and known to the course
// catalog, so the Roadmap page can still provide an actionable first path.
const STARTER_SKILLS = ["Git", "JavaScript", "SQL", "React", "Node.js", "Docker", "AWS"];

const getStarterSkills = async (userId) => {
  const profile = await Profile.findOne({ userId });
  const knownSkills = new Set(normalizeSkillList(profile?.skills || []));
  const gaps = STARTER_SKILLS.filter(
    (skill) => !knownSkills.has(normalizeSkillList([skill])[0])
  );

  // A complete profile may already contain every foundation above. Keep a
  // short path available rather than leaving the page empty.
  return (gaps.length ? gaps : ["Docker", "AWS", "Data Structures and Algorithms"]).slice(0, 4);
};

// Resume History: course recommendations are driven by the missing
// skills from the ACTIVE resume's analysis, not just whichever
// analysis happens to be most recent.
const getActiveResume = async (userId) => {
  const active = await Resume.findOne({ userId, isActive: true });
  if (active) return active;

  return Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });
};

// GET /api/courses/recommend
// Module 5: Course Recommendation, driven by the missing skills from
// the active resume's latest skill-gap analysis (Module 2). Optionally
// accepts ?skills=a,b,c to recommend for a custom list instead.
export const getCourseRecommendations = async (req, res) => {
  try {
    let missingSkills = [];

    if (req.query.skills) {
      missingSkills = req.query.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      const activeResume = await getActiveResume(req.user.id);

      const latest = activeResume
        ? await AnalysisReport.findOne({
            userId: req.user.id,
            resumeId: activeResume._id,
          }).sort({ createdAt: -1 })
        : null;

      missingSkills = latest?.missingSkills?.length
        ? latest.missingSkills
        : await getStarterSkills(req.user.id);
    }

    if (!missingSkills.length) {
      return res.status(200).json({
        courses: [],
        learningPath: [],
        message: "No skill gaps found — nothing to recommend right now.",
      });
    }

    const missingSkillsHash = hashContent(missingSkills.slice().sort().join(","));

    const cached = await CourseRecommendation.findOne({
      userId: req.user.id,
      missingSkillsHash,
    });

    if (cached) {
      return res.status(200).json({ cached: true, report: cached });
    }

    const { courses, learningPath } = await recommendCoursesForSkills(missingSkills);

    const report = await CourseRecommendation.create({
      userId: req.user.id,
      missingSkillsHash,
      missingSkills,
      courses,
      learningPath,
    });

    logActivity({ userId: req.user.id, type: "course_recommendation", message: "Course recommendations generated", metadata: { reportId: report._id } });
    res.status(201).json({ cached: false, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
