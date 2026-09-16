import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API_URL = `${API_ORIGIN}/api/ats`;

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// payload: { jobDescriptionId } OR { jdText, jdTitle }
export const analyzeResumeAgainstJD = (payload) => API.post("/analyze", payload);
export const getLatestAnalysis = () => API.get("/latest");
export const getAnalysisHistory = () => API.get("/history");
