import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";

// Resume Processing Status (derived, not stored):
// The existing schema's `analysisStatus` field (Pending/Processing/
// Completed) is never actually updated anywhere in the codebase — it
// always sits at its default "Pending". Rather than surface a
// meaningless value, admin views derive a real status from fields
// that ARE actually written:
//   - "Analyzed"      -> resume has extractedText AND at least one
//                         AnalysisReport exists for it
//   - "Text Extracted" -> extractedText exists but no analysis yet
//   - "Not Processed"  -> no extractedText yet (never opened for
//                         ATS analysis)
// There is currently no persisted record of extraction FAILURES
// (errors are returned to the user but not saved anywhere), so
// "failed parsing" counts can't be reported truthfully — see
// getResumeParsingStats below for how this is surfaced honestly.
const deriveProcessingStatus = (resume, hasAnalysis) => {
  if (resume.parsingStatus === "Failed") return "Parsing Failed";
  if (resume.parsingStatus === "Processing") return "Parsing";
  if (!resume.extractedText || resume.extractedText.trim().length === 0) return "Not Processed";
  return hasAnalysis ? "Analyzed" : "Text Extracted";
};

// GET /api/admin/resumes?search=&status=&page=&limit=
export const listResumes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const { search, status } = req.query;

    const filter = {};
    if (status === "processed") filter.extractedText = { $exists: true, $nin: ["", null] };
    if (status === "unprocessed") filter.$or = [{ extractedText: { $exists: false } }, { extractedText: "" }];
    if (status === "failed") filter.parsingStatus = "Failed";
    if (status === "processing") filter.parsingStatus = "Processing";

    let userIdFilter = null;
    if (search) {
      // Resumes don't store the user's name/email directly, so search
      // by matching users first, then filtering resumes by userId.
      const User = (await import("../models/User.js")).default;
      const regex = new RegExp(search.trim(), "i");
      const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select("_id");
      userIdFilter = matchingUsers.map((u) => u._id);
      filter.userId = { $in: userIdFilter };
    }

    const [resumes, total] = await Promise.all([
      Resume.find(filter)
        .select("userId originalName fileType fileSize version isActive extractedText parsingStatus parsingError parsedAt createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email"),
      Resume.countDocuments(filter),
    ]);

    const resumeIds = resumes.map((r) => r._id);
    const analyses = await AnalysisReport.find({ resumeId: { $in: resumeIds } }).select("resumeId");
    const analyzedResumeIds = new Set(analyses.map((a) => String(a.resumeId)));

    const withStatus = resumes.map((r) => ({
      _id: r._id,
      user: r.userId ? { id: r.userId._id, name: r.userId.name, email: r.userId.email } : null,
      originalName: r.originalName,
      fileType: r.fileType,
      fileSize: r.fileSize,
      version: r.version,
      isActive: r.isActive,
      createdAt: r.createdAt,
      processingStatus: deriveProcessingStatus(r, analyzedResumeIds.has(String(r._id))),
      parsingStatus: r.parsingStatus,
      parsingError: r.parsingError,
    }));

    res.status(200).json({
      resumes: withStatus,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/resumes/:id
export const getResumeDetail = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate("userId", "name email");

    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const analyses = await AnalysisReport.find({ resumeId: resume._id })
      .sort({ createdAt: -1 })
      .select("atsScore jobTitle overallStatus createdAt");

    res.status(200).json({
      resume: {
        _id: resume._id,
        user: resume.userId ? { id: resume.userId._id, name: resume.userId.name, email: resume.userId.email } : null,
        originalName: resume.originalName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        version: resume.version,
        isActive: resume.isActive,
        createdAt: resume.createdAt,
        processingStatus: deriveProcessingStatus(resume, analyses.length > 0),
        parsingStatus: resume.parsingStatus,
        parsingError: resume.parsingError,
      },
      analyses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/resume-parsing/stats
// Honest, derived-only stats. No "failed" bucket is fabricated — the
// note field explains why.
export const getResumeParsingStats = async (req, res) => {
  try {
    const [total, withText, withAnalysis] = await Promise.all([
      Resume.countDocuments(),
      Resume.countDocuments({ extractedText: { $exists: true, $nin: ["", null] } }),
      AnalysisReport.distinct("resumeId").then((ids) => ids.length),
    ]);

    res.status(200).json({
      totalResumes: total,
      textExtracted: withText,
      notYetProcessed: total - withText,
      analyzed: withAnalysis,
      failedParsing: await Resume.countDocuments({ parsingStatus: "Failed" }),
      parsingInProgress: await Resume.countDocuments({ parsingStatus: "Processing" }),
      note: "Parsing status is now persisted on each resume. Failed records retain a sanitized error message for administrators."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
