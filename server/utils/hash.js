import crypto from "crypto";

// Simple deterministic content hash, used to cache repeated AI analysis
// requests so identical (resume, jobDescription) pairs are not re-sent
// to the AI provider every time.
export const hashContent = (...parts) => {
  const combined = parts.map((p) => String(p || "")).join("::");
  return crypto.createHash("sha256").update(combined).digest("hex");
};

export default hashContent;
