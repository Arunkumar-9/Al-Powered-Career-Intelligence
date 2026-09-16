import mongoose from "mongoose";
import { isAdzunaConfigured } from "../services/jobRecommendationService.js";

// Module 15: System/API Monitoring.
// Reports real, live status (DB connection state, process uptime,
// memory, whether external services have credentials configured) —
// never exposes the credential values themselves, only booleans.

const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

const isConfigured = (value, placeholder) =>
  Boolean(value && value.trim() && value.trim() !== placeholder);

// GET /api/admin/system/status
export const getSystemStatus = async (req, res) => {
  try {
    const dbStateCode = mongoose.connection.readyState;
    const dbStatus = DB_STATES[dbStateCode] || "unknown";

    let dbPingMs = null;
    let dbError = null;
    if (dbStateCode === 1) {
      const start = Date.now();
      try {
        await mongoose.connection.db.admin().ping();
        dbPingMs = Date.now() - start;
      } catch (err) {
        dbError = "Database ping failed";
      }
    }

    const memory = process.memoryUsage();

    res.status(200).json({
      backend: {
        status: "up",
        uptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        memoryUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        memoryTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
      database: {
        status: dbStatus,
        healthy: dbStateCode === 1 && !dbError,
        pingMs: dbPingMs,
        error: dbError,
      },
      externalServices: [
        {
          name: "Adzuna Job Search API",
          configured: isAdzunaConfigured(),
          usedFor: "Job Recommendation search (Module 4)",
        },
        {
          name: "Groq AI API",
          configured: isConfigured(process.env.GROQ_API_KEY, "your_groq_api_key"),
          usedFor: "ATS analysis, career/skill-gap AI features",
        },
      ],
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
