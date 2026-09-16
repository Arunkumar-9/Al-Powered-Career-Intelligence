import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API_URL = `${API_ORIGIN}/api/resume-improvement`;

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const generateResumeImprovements = (payload = {}) => API.post("/generate", payload);
export const getLatestImprovement = () => API.get("/latest");
