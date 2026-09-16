import Resume from "../models/Resume.js";
import JobDescription from "../models/JobDescription.js";
import ResumeImprovement from "../models/ResumeImprovement.js";
import { extractResumeTextSmart } from "../services/resumeService.js";
import { generateResumeImprovements } from "../services/aiService.js";
import { hashContent } from "../utils/hash.js";

// Resume History: users can pick any previous version as their
// "active" resume, so improvements must be generated from whichever
// one is currently flagged active (falling back to the most recent
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
  const text = await extractResumeTextSmart(resume.filePath);
  resume.extractedText = text;
  await resume.save();
  return text;
};

// POST /api/resume-improvement/generate
// Body: { jobDescriptionId? , jdText? } — both optional; improvements
// can be generated resume-only or tailored against a specific JD.
export const generateImprovements = async (req, res) => {
  try {
    const { jobDescriptionId, jdText } = req.body;

    // Resume History: a user may now have several uploaded versions,
    // so always target their currently active one.
    const resume = await getActiveResume(req.user.id);
    if (!resume) {
      return res.status(404).json({ message: "Please upload a resume first" });
    }

    let jdContent = jdText || "";

    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user.id,
      });
      if (jd) jdContent = jd.text;
    }

    const resumeText = await getResumeText(resume);
    const contentHash = hashContent(resumeText, jdContent);

    const cached = await ResumeImprovement.findOne({
      userId: req.user.id,
      contentHash,
    });

    if (cached) {
      return res.status(200).json({ cached: true, report: cached });
    }

    const result = await generateResumeImprovements(resumeText, jdContent);

    const report = await ResumeImprovement.create({
      userId: req.user.id,
      resumeId: resume._id,
      contentHash,
      summary: result.summary || { before: "", after: "" },
      missingKeywords: result.missingKeywords || [],
      projectImprovements: result.projectImprovements || [],
      certificationSuggestions: result.certificationSuggestions || [],
      technicalSkillImprovements: result.technicalSkillImprovements || [],
      formattingSuggestions: result.formattingSuggestions || [],
      grammarSuggestions: result.grammarSuggestions || [],
      atsOptimizationTips: result.atsOptimizationTips || [],
    });

    res.status(201).json({ cached: false, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/resume-improvement/latest
// Resume History: returns the latest improvement report for whichever
// resume version is currently active.
export const getLatestImprovement = async (req, res) => {
  try {
    const activeResume = await getActiveResume(req.user.id);
    if (!activeResume) {
      return res.status(404).json({ message: "No resume improvement report found yet" });
    }

    const report = await ResumeImprovement.findOne({
      userId: req.user.id,
      resumeId: activeResume._id,
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({ message: "No resume improvement report found yet" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
