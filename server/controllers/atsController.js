import Resume from "../models/Resume.js";
import JobDescription from "../models/JobDescription.js";
import AnalysisReport from "../models/AnalysisReport.js";
import { extractResumeTextSmart } from "../services/resumeService.js";
import { compareResumeToJD } from "../services/aiService.js";
import { hashContent } from "../utils/hash.js";
import { logActivity } from "../utils/logActivity.js";

// Resume History: users can pick any previous version as their
// "active" resume, so analysis must run against whichever one is
// currently flagged active (falling back to the most recent upload
// for any legacy data that predates the isActive field).
const getActiveResume = async (userId) => {
  const active = await Resume.findOne({ userId, isActive: true });
  if (active) return active;

  return Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });
};

// Ensures we have resume text without re-parsing the file on every
// request (reuses & caches Resume.extractedText).
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

const deriveStatus = (matchPercentage) => {
  if (matchPercentage >= 85) return "Excellent Match";
  if (matchPercentage >= 65) return "Good Match";
  if (matchPercentage >= 40) return "Average Match";
  return "Poor Match";
};

// POST /api/ats/analyze
// Body: { jobDescriptionId? , jdText?, jdTitle? }
// Runs Module 1 (ATS) + Module 2 (Skill Gap) analysis in one AI call
// and caches the result so identical resume/JD pairs are not
// re-analyzed unnecessarily.
export const analyzeResumeAgainstJD = async (req, res) => {
  try {
    const { jobDescriptionId, jdText, jdTitle } = req.body;

    // Resume History: a user may now have several uploaded versions,
    // so always target their currently active one.
    const resume = await getActiveResume(req.user.id);
    if (!resume) {
      return res.status(404).json({ message: "Please upload a resume first" });
    }

    let jobDescription = null;
    let jdContent = jdText;
    let title = jdTitle || "Pasted Job Description";

    if (jobDescriptionId) {
      jobDescription = await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user.id,
      });

      if (!jobDescription) {
        return res.status(404).json({ message: "Job description not found" });
      }

      jdContent = jobDescription.text;
      title = jobDescription.title;
    }

    if (!jdContent || !jdContent.trim()) {
      return res.status(400).json({
        message: "Provide jdText or jobDescriptionId to run the analysis",
      });
    }

    const resumeText = await getResumeText(resume);
    const contentHash = hashContent(resumeText, jdContent);

    // Serve cached analysis if this exact pairing was analyzed before.
    const cached = await AnalysisReport.findOne({
      userId: req.user.id,
      contentHash,
    });

    if (cached) {
      return res.status(200).json({ cached: true, report: cached });
    }

    const result = await compareResumeToJD(resumeText, jdContent);

    const report = await AnalysisReport.create({
      userId: req.user.id,
      resumeId: resume._id,
      jobDescriptionId: jobDescription ? jobDescription._id : null,
      jobTitle: title,
      contentHash,
      atsScore: result.atsScore || 0,
      matchPercentage: result.matchPercentage || 0,
      keywordMatchPercentage: result.keywordMatchPercentage || 0,
      overallStatus: result.overallStatus || deriveStatus(result.matchPercentage || 0),
      matchingKeywords: result.matchingKeywords || [],
      missingKeywords: result.missingKeywords || [],
      importantMissingTechnologies: result.importantMissingTechnologies || [],
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      matchingSkills: result.matchingSkills || [],
      missingSkills: result.missingSkills || [],
      recommendedSkills: result.recommendedSkills || [],
      skillMatchPercentage: result.skillMatchPercentage || 0,
    });

    logActivity({ userId: req.user.id, type: "resume_analysis", message: `Resume analyzed with ATS score ${report.atsScore}`, metadata: { reportId: report._id, resumeId: resume._id, atsScore: report.atsScore } });
    res.status(201).json({ cached: false, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/ats/latest
// Resume History: returns the latest analysis for whichever resume
// version is currently active, not just the most recent analysis
// ever run (which could belong to an older, now-inactive version).
export const getLatestAnalysis = async (req, res) => {
  try {
    const activeResume = await getActiveResume(req.user.id);
    if (!activeResume) {
      return res.status(404).json({ message: "No analysis found yet" });
    }

    const report = await AnalysisReport.findOne({
      userId: req.user.id,
      resumeId: activeResume._id,
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({ message: "No analysis found yet" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/ats/history
export const getAnalysisHistory = async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
