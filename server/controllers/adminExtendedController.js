import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import mongooseConnection from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import CareerRecommendation from "../models/CareerRecommendation.js";
import CourseRecommendation from "../models/CourseRecommendation.js";
import JobDescription from "../models/JobDescription.js";
import JobSearchLog from "../models/JobSearchLog.js";
import ActivityLog from "../models/ActivityLog.js";
import Feedback from "../models/Feedback.js";
import Course from "../models/Course.js";
import { isAdzunaConfigured } from "../services/jobRecommendationService.js";

const oid = (id) => mongoose.Types.ObjectId.isValid(id);
const pageData = (q) => ({
  page: Math.max(parseInt(q.page, 10) || 1, 1),
  limit: Math.min(Math.max(parseInt(q.limit, 10) || 10, 1), 100),
});
const safeRegex = (value) => new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

export const listProfiles = async (req, res) => {
  try {
    const { page, limit } = pageData(req.query);
    const search = (req.query.search || "").trim();
    const filter = {};
    if (search) filter.$or = [{ college: safeRegex(search) }, { degree: safeRegex(search) }, { branch: safeRegex(search) }, { skills: safeRegex(search) }];
    const [profiles, total] = await Promise.all([
      Profile.find(filter).populate("userId", "name email role isActive createdAt lastLoginAt").sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
      Profile.countDocuments(filter),
    ]);
    const items = profiles.map((p) => {
      const fields = ["college", "degree", "branch", "graduationYear", "cgpa", "skills", "interests", "careerGoal", "preferredRole", "experience", "location"];
      const complete = fields.reduce((n, f) => n + (Array.isArray(p[f]) ? (p[f].length ? 1 : 0) : p[f] !== undefined && p[f] !== null && String(p[f]).trim() ? 1 : 0), 0);
      return { ...p.toObject(), completion: Math.round((complete / fields.length) * 100) };
    });
    res.json({ profiles: items, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (error) { res.status(500).json({ message: "Failed to load profiles" }); }
};

export const getProfileAdmin = async (req, res) => {
  try {
    if (!oid(req.params.id)) return res.status(400).json({ message: "Invalid profile id" });
    const profile = await Profile.findById(req.params.id).populate("userId", "name email role isActive createdAt lastLoginAt");
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ profile });
  } catch (error) { res.status(500).json({ message: "Failed to load profile" }); }
};

export const listFeedback = async (req, res) => {
  try {
    const { page, limit } = pageData(req.query);
    const filter = {};
    if (req.query.status && ["new", "reviewed", "resolved"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.search) filter.$or = [{ comment: safeRegex(req.query.search) }, { category: safeRegex(req.query.search) }];
    const [feedback, total] = await Promise.all([
      Feedback.find(filter).populate("userId", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Feedback.countDocuments(filter),
    ]);
    const summary = await Feedback.aggregate([{ $group: { _id: null, averageRating: { $avg: "$rating" }, total: { $sum: 1 } } }]);
    res.json({ feedback, summary: { averageRating: summary[0] ? Number(summary[0].averageRating.toFixed(1)) : 0, total: summary[0]?.total || 0 }, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (error) { res.status(500).json({ message: "Failed to load feedback" }); }
};

export const updateFeedback = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (status && !["new", "reviewed", "resolved"].includes(status)) return res.status(400).json({ message: "Invalid feedback status" });
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { ...(status ? { status } : {}), ...(adminNote !== undefined ? { adminNote } : {}) }, { new: true }).populate("userId", "name email");
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback updated", feedback });
  } catch (error) { res.status(500).json({ message: "Failed to update feedback" }); }
};

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ message: "Course created", course });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const listCourses = async (req, res) => {
  try {
    const { page, limit } = pageData(req.query);
    const filter = {};
    if (req.query.search) filter.$or = [{ title: safeRegex(req.query.search) }, { provider: safeRegex(req.query.search) }, { skill: safeRegex(req.query.search) }, { category: safeRegex(req.query.search) }];
    if (req.query.status === "active") filter.isActive = true;
    if (req.query.status === "inactive") filter.isActive = false;
    const [courses, total] = await Promise.all([Course.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), Course.countDocuments(filter)]);
    res.json({ courses, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (error) { res.status(500).json({ message: "Failed to load courses" }); }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated", course });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deactivated", course });
  } catch (error) { res.status(500).json({ message: "Failed to deactivate course" }); }
};

export const listActivity = async (req, res) => {
  try {
    const { page, limit } = pageData(req.query);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) { const d = new Date(req.query.to); d.setHours(23, 59, 59, 999); filter.createdAt.$lte = d; }
    }
    const [activity, total] = await Promise.all([ActivityLog.find(filter).populate("userId", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), ActivityLog.countDocuments(filter)]);
    res.json({ activity, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (error) { res.status(500).json({ message: "Failed to load activity" }); }
};

export const getSystemStatus = async (req, res) => {
  const dbState = mongooseConnection.connection.readyState;
  let dbMessage = "disconnected";
  if (dbState === 1) dbMessage = "connected";
  if (dbState === 2) dbMessage = "connecting";
  const aiConfigured = Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
  let uploadWritable = false;
  try { const uploadDir = path.resolve("uploads"); fs.mkdirSync(uploadDir, { recursive: true }); fs.accessSync(uploadDir, fs.constants.W_OK); uploadWritable = true; } catch { uploadWritable = false; }
  res.json({ generatedAt: new Date(), services: [
    { name: "Backend API", status: "healthy", detail: "Express server is responding" },
    { name: "MongoDB", status: dbState === 1 ? "healthy" : dbState === 2 ? "degraded" : "down", detail: dbMessage },
    { name: "Adzuna Job API", status: isAdzunaConfigured() ? "configured" : "not-configured", detail: isAdzunaConfigured() ? "Credentials configured" : "Missing job API credentials" },
    { name: "AI Service", status: aiConfigured ? "configured" : "not-configured", detail: aiConfigured ? "AI credentials configured" : "AI credentials missing" },
    { name: "Resume Storage", status: uploadWritable ? "healthy" : "degraded", detail: uploadWritable ? "Upload directory writable" : "Upload directory is not writable" },
  ], metrics: { adminRequestsTracked: false, historicalApiErrorsTracked: false } });
};

export const getNotifications = async (req, res) => {
  try {
    const [failedResumes, recentUsers, feedback] = await Promise.all([
      Resume.find({ parsingStatus: "Failed" }).sort({ createdAt: -1 }).limit(5).populate("userId", "name email"),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email createdAt"),
      Feedback.find({ status: "new" }).sort({ createdAt: -1 }).limit(5).populate("userId", "name email"),
    ]);
    const alerts = [
      ...failedResumes.map((r) => ({ type: "resume", severity: "warning", message: `Resume parsing incomplete for ${r.userId?.name || "a user"}`, timestamp: r.createdAt })),
      ...recentUsers.map((u) => ({ type: "user", severity: "info", message: `New user registered: ${u.name}`, timestamp: u.createdAt })),
      ...feedback.map((f) => ({ type: "feedback", severity: f.rating <= 2 ? "high" : "info", message: `New ${f.rating}/5 feedback${f.userId?.name ? ` from ${f.userId.name}` : ""}`, timestamp: f.createdAt })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);
    res.json({ alerts });
  } catch (error) { res.status(500).json({ message: "Failed to load notifications" }); }
};

export const getReports = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    to.setHours(23, 59, 59, 999);
    const [users, resumes, analyses, jobs, careers, jobSearches] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      Resume.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      AnalysisReport.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      JobDescription.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      CareerRecommendation.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      JobSearchLog.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    ]);
    res.json({ from, to, metrics: { users, resumes, analyses, jobs, careerRecommendations: careers, jobSearches } });
  } catch (error) { res.status(500).json({ message: "Failed to generate report" }); }
};

export const getJobRecommendationAnalytics = async (req, res) => {
  try {
    const [summary, queries, jobs] = await Promise.all([
      JobSearchLog.aggregate([{ $group: { _id: null, searches: { $sum: 1 }, jobsReturned: { $sum: "$resultCount" }, avgResults: { $avg: "$resultCount" } } }]),
      JobSearchLog.aggregate([{ $match: { query: { $ne: "" } } }, { $group: { _id: "$query", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 15 }]),
      JobSearchLog.aggregate([{ $unwind: "$jobs" }, { $group: { _id: "$jobs.externalId", title: { $first: "$jobs.title" }, company: { $first: "$jobs.company" }, appearances: { $sum: 1 }, avgMatch: { $avg: "$jobs.matchPercentage" } } }, { $sort: { appearances: -1 } }, { $limit: 15 }]),
    ]);
    res.json({ summary: { searches: summary[0]?.searches || 0, jobsReturned: summary[0]?.jobsReturned || 0, averageResults: Math.round(summary[0]?.avgResults || 0) }, topQueries: queries.map((q) => ({ query: q._id, count: q.count })), topJobs: jobs.map((j) => ({ id: j._id, title: j.title, company: j.company, appearances: j.appearances, averageMatch: Math.round(j.avgMatch || 0) })) });
  } catch (error) { res.status(500).json({ message: "Failed to load job recommendation analytics" }); }
};

export const exportUsersCsv = async (req, res) => {
  try {
    const users = await User.find().select("name email role isActive createdAt lastLoginAt").sort({ createdAt: -1 }).lean();
    const csv = ["Name,Email,Role,Status,Registered,Last Login", ...users.map((u) => [u.name, u.email, u.role, u.isActive === false ? "inactive" : "active", u.createdAt?.toISOString() || "", u.lastLoginAt?.toISOString() || ""].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="careerai-users-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) { res.status(500).json({ message: "Failed to export users" }); }
};

export const adminViewResume = async (req, res) => {
  try {
    if (!oid(req.params.id)) return res.status(400).json({ message: "Invalid resume id" });
    const resume = await Resume.findById(req.params.id);
    if (!resume || !resume.filePath || !fs.existsSync(resume.filePath)) return res.status(404).json({ message: "Resume file not found" });
    res.setHeader("Content-Type", resume.fileType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(resume.originalName)}"`);
    fs.createReadStream(path.resolve(resume.filePath)).pipe(res);
  } catch (error) { res.status(500).json({ message: "Failed to open resume" }); }
};

export const adminDownloadResume = async (req, res) => {
  try {
    if (!oid(req.params.id)) return res.status(400).json({ message: "Invalid resume id" });
    const resume = await Resume.findById(req.params.id);
    if (!resume || !resume.filePath || !fs.existsSync(resume.filePath)) return res.status(404).json({ message: "Resume file not found" });
    res.download(path.resolve(resume.filePath), resume.originalName);
  } catch (error) { res.status(500).json({ message: "Failed to download resume" }); }
};

export const getJobSearchActivity = async (req, res) => {
  try {
    const { page, limit } = pageData(req.query);
    const [items, total] = await Promise.all([JobSearchLog.find().populate("userId", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), JobSearchLog.countDocuments()]);
    res.json({ items, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } });
  } catch (error) { res.status(500).json({ message: "Failed to load job search activity" }); }
};
