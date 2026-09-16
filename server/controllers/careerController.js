import Resume from "../models/Resume.js";
import Profile from "../models/Profile.js";
import CareerRecommendation from "../models/CareerRecommendation.js";
import { extractResumeTextSmart } from "../services/resumeService.js";
import { recommendCareers } from "../services/aiService.js";
import { hashContent } from "../utils/hash.js";
import { logActivity } from "../utils/logActivity.js";

// Resume History: users can pick any previous version as their
// "active" resume, so recommendations must be based on whichever one
// is currently flagged active (falling back to the most recent
// upload for any legacy data that predates the isActive field).
const getActiveResume = async (userId) => {
  const active = await Resume.findOne({ userId, isActive: true });
  if (active) return active;

  return Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });
};

const getResumeText = async (resume) => {
  if (resume.extractedText && resume.extractedText.trim().length > 0) {
    return resume.extractedText;
  }
  resume.parsingStatus = "Processing";
  resume.parsingError = "";
  await resume.save();
  try {
    const text = await extractResumeTextSmart(resume.filePath);
    resume.extractedText = text;
    resume.parsingStatus = "Completed";
    resume.parsedAt = new Date();
    await resume.save();
    return text;
  } catch (error) {
    resume.parsingStatus = "Failed";
    resume.parsingError = String(error.message || "Resume parsing failed").slice(0, 500);
    await resume.save();
    throw error;
  }
};

const buildProfileSummary = (profile, resumeText) => {
  const profileLines = profile
    ? [
        `Degree: ${profile.degree || "N/A"}`,
        `Branch: ${profile.branch || "N/A"}`,
        `College: ${profile.college || "N/A"}`,
        `CGPA: ${profile.cgpa || "N/A"}`,
        `Skills: ${(profile.skills || []).join(", ") || "N/A"}`,
        `Interests: ${(profile.interests || []).join(", ") || "N/A"}`,
        `Career Goal: ${profile.careerGoal || "N/A"}`,
        `Experience: ${profile.experience || "N/A"}`,
      ].join("\n")
    : "No profile data provided.";

  return `${profileLines}\n\nResume Content:\n${resumeText}`;
};

// POST /api/career/recommend
export const getCareerRecommendations = async (req, res) => {
  try {
    // Resume History: a user may now have several uploaded versions,
    // so always target their currently active one.
    const resume = await getActiveResume(req.user.id);
    if (!resume) {
      return res.status(404).json({ message: "Please upload a resume first" });
    }

    const profile = await Profile.findOne({ userId: req.user.id });
    const resumeText = await getResumeText(resume);
    const profileSummary = buildProfileSummary(profile, resumeText);
    const contentHash = hashContent(profileSummary);

    const cached = await CareerRecommendation.findOne({
      userId: req.user.id,
      contentHash,
    });

    if (cached) {
      return res.status(200).json({ cached: true, report: cached });
    }

    const result = await recommendCareers(profileSummary);

    const report = await CareerRecommendation.create({
      userId: req.user.id,
      resumeId: resume._id,
      contentHash,
      recommendations: result.recommendations || [],
    });

    logActivity({ userId: req.user.id, type: "career_recommendation", message: "Career recommendations generated", metadata: { reportId: report._id } });
    res.status(201).json({ cached: false, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/career/latest
// Resume History: returns the latest career recommendation for
// whichever resume version is currently active.
export const getLatestCareerRecommendation = async (req, res) => {
  try {
    const activeResume = await getActiveResume(req.user.id);
    if (!activeResume) {
      return res.status(404).json({ message: "No career recommendation found yet" });
    }

    const report = await CareerRecommendation.findOne({
      userId: req.user.id,
      resumeId: activeResume._id,
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({ message: "No career recommendation found yet" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
