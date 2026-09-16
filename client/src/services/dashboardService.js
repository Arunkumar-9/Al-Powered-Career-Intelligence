import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API_URL = `${API_ORIGIN}/api/dashboard`;

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDashboardSummary = () => API.get("/summary");
