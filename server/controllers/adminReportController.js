import User from "../models/User.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import JobDescription from "../models/JobDescription.js";
import Feedback from "../models/Feedback.js";

// Module 16: Search, Filter & Reports.

const toCsv = (rows, columns) => {
  const header = columns.map((c) => c.label).join(",");
  const escape = (val) => {
    const str = val === undefined || val === null ? "" : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = rows.map((row) => columns.map((c) => escape(c.value(row))).join(","));
  return [header, ...lines].join("\n");
};

// GET /api/admin/reports/users.csv
export const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("name email role isActive lastLoginAt createdAt").sort({ createdAt: -1 });

    const csv = toCsv(users, [
      { label: "Name", value: (u) => u.name },
      { label: "Email", value: (u) => u.email },
      { label: "Role", value: (u) => u.role },
      { label: "Status", value: (u) => (u.isActive === false ? "Inactive" : "Active") },
      { label: "Registered", value: (u) => new Date(u.createdAt).toISOString() },
      { label: "Last Login", value: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "Never") },
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users-report.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/resumes.csv
export const exportResumesReport = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .select("originalName analysisStatus resumeScore version createdAt userId")
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    const csv = toCsv(resumes, [
      { label: "File Name", value: (r) => r.originalName },
      { label: "User", value: (r) => r.userId?.name || "Unknown" },
      { label: "Email", value: (r) => r.userId?.email || "" },
      { label: "Status", value: (r) => r.analysisStatus },
      { label: "Score", value: (r) => r.resumeScore },
      { label: "Version", value: (r) => r.version },
      { label: "Uploaded", value: (r) => new Date(r.createdAt).toISOString() },
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=resumes-report.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/ats-analyses.csv
export const exportAtsReport = async (req, res) => {
  try {
    const reports = await AnalysisReport.find()
      .select("atsScore jobTitle overallStatus matchPercentage createdAt userId")
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    const csv = toCsv(reports, [
      { label: "User", value: (r) => r.userId?.name || "Unknown" },
      { label: "Email", value: (r) => r.userId?.email || "" },
      { label: "Job Title", value: (r) => r.jobTitle },
      { label: "ATS Score", value: (r) => r.atsScore },
      { label: "Match %", value: (r) => r.matchPercentage },
      { label: "Status", value: (r) => r.overallStatus },
      { label: "Date", value: (r) => new Date(r.createdAt).toISOString() },
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ats-analyses-report.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/search?q=  — global search across users, resumes, jobs, feedback
export const globalSearch = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ message: "Query parameter 'q' is required" });

    const regex = new RegExp(q, "i");

    const [users, resumes, jobs, feedback] = await Promise.all([
      User.find({ $or: [{ name: regex }, { email: regex }] }).select("name email role").limit(5),
      Resume.find({ originalName: regex }).select("originalName userId createdAt").populate("userId", "name email").limit(5),
      JobDescription.find({ $or: [{ title: regex }, { company: regex }] }).select("title company createdAt").limit(5),
      Feedback.find({ message: regex }).select("message status createdAt").limit(5),
    ]);

    res.status(200).json({
      query: q,
      results: {
        users: users.map((u) => ({ id: u._id, label: `${u.name} (${u.email})`, type: "user" })),
        resumes: resumes.map((r) => ({ id: r._id, label: `${r.originalName} — ${r.userId?.name || "Unknown"}`, type: "resume" })),
        jobs: jobs.map((j) => ({ id: j._id, label: `${j.title}${j.company ? ` @ ${j.company}` : ""}`, type: "job" })),
        feedback: feedback.map((f) => ({ id: f._id, label: f.message.slice(0, 80), type: "feedback" })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
