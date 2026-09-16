import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API_URL = `${API_ORIGIN}/api/resume`;

// Create Axios Instance
const API = axios.create({
  baseURL: API_URL,
});

// Automatically attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// Upload Resume
// =============================
export const uploadResume = async (formData) => {
  return API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// =============================
// Get Resume
// =============================
export const getResume = async () => {
  return API.get("/");
};

// =============================
// Delete Resume
// =============================
export const deleteResume = async () => {
  return API.delete("/");
};

// =============================
// Download Resume
// =============================
export const downloadResume = async () => {
  return API.get("/download", {
    responseType: "blob",
  });
};

// =============================
// Analyze Resume (Coming Soon)
// =============================
export const analyzeResume = async () => {
  return API.post("/analyze");
};

// =============================
// Resume History
// =============================

// params: { search, sort, page, limit }
export const getResumeHistory = async (params = {}) => {
  return API.get("/history", { params });
};

// Opens a specific resume version's PDF/DOC inline in a new tab.
// Uses the secured, ownership-checked /history/:id/view endpoint
// (rather than a raw static file URL) and streams it through axios
// with the auth token attached, since the file is not publicly
// accessible by id.
export const viewResumeVersion = async (id) => {
  const res = await API.get(`/history/${id}/view`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(
    new Blob([res.data], { type: res.headers["content-type"] })
  );

  window.open(blobUrl, "_blank", "noopener,noreferrer");

  // Release the blob URL after giving the new tab time to load it.
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
};

// Downloads a specific resume version.
export const downloadResumeVersion = async (id, fileName) => {
  const res = await API.get(`/history/${id}/download`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName || "resume";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

// Deletes one specific resume version from history.
export const deleteResumeVersion = async (id) => {
  return API.delete(`/history/${id}`);
};

// Sets a specific resume version as the active one — used everywhere
// else in the app (ATS analysis, career match, resume improvement,
// profile/dashboard usage) until changed again.
export const activateResumeVersion = async (id) => {
  return API.patch(`/history/${id}/activate`);
};

// Custom event name broadcast on every successful upload, delete, or
// "Set as Active" action so the embedded Resume History section (and
// the main resume overview above it) can refresh immediately.
export const RESUME_UPLOADED_EVENT = "resume:uploaded";

export const notifyResumeUploaded = () => {
  window.dispatchEvent(new Event(RESUME_UPLOADED_EVENT));
};
