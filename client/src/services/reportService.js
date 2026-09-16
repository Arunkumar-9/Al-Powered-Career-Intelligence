import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API = axios.create({
  baseURL: `${API_ORIGIN}/api/report`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getReport = () => API.get("/");
