import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API = axios.create({
  baseURL: `${API_ORIGIN}/api/feedback`,
});

// Automatically attach JWT (same pattern as profileService.js)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const submitFeedback = (data) => API.post("/", data);
export const getMyFeedback = () => API.get("/mine");
