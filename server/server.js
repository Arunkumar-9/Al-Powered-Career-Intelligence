import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// ---- Milestone 3: AI Powered Career Intelligence ----
import jobDescriptionRoutes from "./routes/jobDescriptionRoutes.js";
import atsRoutes from "./routes/atsRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import resumeImprovementRoutes from "./routes/resumeImprovementRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// ---- Admin Dashboard ----
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();
const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../client/dist");
const defaultClientUrl = process.env.RENDER_EXTERNAL_HOSTNAME
  ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
  : "http://localhost:5173,http://localhost:8080";

const allowedOrigins = (process.env.CLIENT_URL || defaultClientUrl)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/profile", profileRoutes);

// ---- Milestone 3: AI Powered Career Intelligence ----
app.use("/api/jd", jobDescriptionRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/resume-improvement", resumeImprovementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chat", chatRoutes);

// ---- Admin Dashboard ----
app.use("/api/admin", adminRoutes);

app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.json({
    message: "AI Career Guidance Backend Running 🚀",
  });
});

// The production Docker image contains the Vite build. Serve it from the
// Express app so the UI and API share a single Render URL.
if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
