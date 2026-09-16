import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import { logActivity } from "../utils/logActivity.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// The single resume version currently marked "active" for this user
// (used across ATS analysis, job applications, profile usage, and the
// main Resume page). Falls back to the highest version / most recent
// upload if, for any reason, nothing is flagged active yet (e.g.
// legacy documents created before this field existed) — this keeps
// old data working without a manual migration.
const findActiveResume = async (userId) => {
  const active = await Resume.findOne({ userId, isActive: true });
  if (active) return active;

  return Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });
};

const findHighestVersion = (userId) =>
  Resume.findOne({ userId }).sort({ version: -1, createdAt: -1 });

// =====================================================================
// POST /api/resume/upload
// Resume History feature: every upload creates a brand-new version
// instead of overwriting/deleting the previous file & document. The
// newly uploaded version becomes the active one by default (per
// requirement: "keep the latest upload selected by default"), but the
// user can switch back to an older version afterwards from history.
// =====================================================================
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No resume uploaded",
      });
    }

    const currentHighest = await findHighestVersion(req.user.id);
    const nextVersion = currentHighest ? (currentHighest.version || 1) + 1 : 1;

    // Unset active on every existing version for this user (there
    // should only ever be one, but this is defensive against any
    // legacy/inconsistent data).
    await Resume.updateMany(
      { userId: req.user.id, isActive: true },
      { $set: { isActive: false } }
    );

    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      version: nextVersion,
      isActive: true,
    });

    logActivity({ userId: req.user.id, type: "resume_upload", message: `Resume uploaded: ${resume.originalName}`, metadata: { resumeId: resume._id, version: resume.version } });

    res.status(201).json({
      message: currentHighest
        ? `Resume uploaded successfully as version ${nextVersion}`
        : "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/resume/  — unchanged contract: returns the user's resume
// for the main Resume page. Now returns the ACTIVE version (which is
// the latest upload by default, or whichever version the user picked
// via "Set as Active" in Resume History).
export const getResume = async (req, res) => {
  try {
    const resume = await findActiveResume(req.user.id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /api/resume/ — unchanged contract: deletes the ACTIVE resume,
// same as before. Older versions are untouched and remain visible in
// Resume History. If another version exists, the most recent
// remaining one is promoted to active so the main Resume page still
// shows a resume, consistent with prior single-resume behaviour.
export const deleteResume = async (req, res) => {
  try {
    const active = await findActiveResume(req.user.id);

    if (!active) {
      return res.json({
        message: "Resume deleted successfully",
      });
    }

    if (fs.existsSync(active.filePath)) {
      fs.unlinkSync(active.filePath);
    }

    await Resume.deleteOne({ _id: active._id });

    const promoted = await findHighestVersion(req.user.id);
    if (promoted) {
      promoted.isActive = true;
      await promoted.save();
    }

    res.json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================================
// Resume History feature
// =====================================================================

// GET /api/resume/history
// Query params: search, sort (newest|oldest|version), page, limit
// Returns every version belonging to the logged-in user only, newest
// first by default, each annotated with its most recent ATS score
// (if any analysis has been run against that specific version) and
// whether it's the currently active version.
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const search = (req.query.search || "").toString().trim();

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      version: { version: -1 },
    };
    const sortOption = sortMap[req.query.sort] || sortMap.newest;

    const filter = { userId };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.originalName = { $regex: escaped, $options: "i" };
    }

    const [total, resumes] = await Promise.all([
      Resume.countDocuments(filter),
      Resume.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Batch-fetch ATS scores for just this page of resumes (avoids an
    // N+1 query per row). If a resume was analyzed more than once,
    // the most recent report's score is used.
    const resumeIds = resumes.map((r) => r._id);
    const reports = resumeIds.length
      ? await AnalysisReport.find({
          userId,
          resumeId: { $in: resumeIds },
        }).sort({ createdAt: -1 })
      : [];

    const scoreByResumeId = new Map();
    for (const report of reports) {
      const key = String(report.resumeId);
      if (!scoreByResumeId.has(key)) {
        scoreByResumeId.set(key, report.atsScore);
      }
    }

    const items = resumes.map((r) => ({
      _id: r._id,
      fileName: r.originalName,
      fileType: r.fileType,
      fileSize: r.fileSize,
      uploadDate: r.createdAt,
      version: r.version,
      isActive: r.isActive,
      analysisStatus: r.analysisStatus,
      atsScore: scoreByResumeId.has(String(r._id)) ? scoreByResumeId.get(String(r._id)) : null,
    }));

    res.status(200).json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/resume/history/:id/view
// Streams the PDF/DOC inline so it can be opened in-app/new tab.
// Ownership is checked explicitly (userId must match the token) so a
// user can never view another user's resume by guessing an id.
export const viewResumeVersion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.setHeader("Content-Type", resume.fileType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(resume.originalName)}"`
    );

    fs.createReadStream(path.resolve(resume.filePath)).pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/resume/history/:id/download
// Same ownership check as view, but forces a download.
export const downloadResumeVersion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(path.resolve(resume.filePath), resume.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/resume/history/:id
// Deletes one specific version. If it happened to be the active one,
// the most recent remaining version (if any) is promoted to active so
// the main Resume page and every other module (ATS, career match,
// etc.) keep having a valid resume to work with.
export const deleteResumeVersion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const wasActive = resume.isActive;

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await Resume.deleteOne({ _id: resume._id });

    if (wasActive) {
      const promoted = await findHighestVersion(req.user.id);
      if (promoted) {
        promoted.isActive = true;
        await promoted.save();
      }
    }

    res.status(200).json({ message: "Resume version deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/resume/history/:id/activate
// Lets the user pick any previous version to become the active resume
// used everywhere else in the app (ATS analysis, job applications,
// profile usage, the main Resume page).
export const activateResumeVersion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!resume.isActive) {
      await Resume.updateMany(
        { userId: req.user.id, isActive: true },
        { $set: { isActive: false } }
      );

      resume.isActive = true;
      await resume.save();
    }

    res.status(200).json({
      message: `Version ${resume.version} is now your active resume`,
      resume,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
