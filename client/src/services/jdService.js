import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API_URL = `${API_ORIGIN}/api/jd`;

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const addJobDescription = (payload) => API.post("/", payload);
export const listJobDescriptions = () => API.get("/");
export const getJobDescription = (id) => API.get(`/${id}`);
export const deleteJobDescription = (id) => API.delete(`/${id}`);
