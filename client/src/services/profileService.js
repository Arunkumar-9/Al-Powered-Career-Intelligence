import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API = axios.create({
  baseURL: `${API_ORIGIN}/api/profile`,
});

// Automatically attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const createProfile = (data) => API.post("/", data);

export const getProfile = () => API.get("/");

export const updateProfile = (data) => API.put("/", data);
