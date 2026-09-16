import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API_URL = `${API_ORIGIN}/api/admin`;
const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use((response) => response, (error) => {
  if ([401, 403].includes(error.response?.status)) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }
  return Promise.reject(error);
});

export const adminLogin = (credentials) => API.post("/auth/login", credentials);
export const getAdminSession = () => API.get("/auth/me");
export const getDashboardStats = () => API.get("/dashboard/stats");

export const listUsers = (params) => API.get("/users", { params });
export const getUserDetail = (id) => API.get(`/users/${id}`);
export const updateUserStatus = (id, isActive) => API.patch(`/users/${id}/status`, { isActive });
export const updateUserRole = (id, role) => API.patch(`/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const exportUsers = () => API.get("/users/export.csv", { responseType: "blob" });

export const listProfiles = (params) => API.get("/profiles", { params });
export const getProfileAdmin = (id) => API.get(`/profiles/${id}`);

export const listResumes = (params) => API.get("/resumes", { params });
export const getResumeDetail = (id) => API.get(`/resumes/${id}`);
export const getResumeParsingStats = () => API.get("/resume-parsing/stats");
export const getAdminResumeView = (id) => API.get(`/resumes/${id}/view`, { responseType: "blob" });
export const downloadAdminResume = (id) => API.get(`/resumes/${id}/download`, { responseType: "blob" });

export const listJobDescriptions = (params) => API.get("/jobs", { params });
export const getJobDescriptionDetail = (id) => API.get(`/jobs/${id}`);
export const deleteJobDescription = (id) => API.delete(`/jobs/${id}`);

export const getAtsAnalytics = (params) => API.get("/analytics/ats", { params });
export const getSkillGapAnalytics = (params) => API.get("/analytics/skill-gap", { params });
export const getCareerAnalytics = (params) => API.get("/analytics/careers", { params });
export const getJobRecommendationAnalytics = () => API.get("/analytics/job-recommendations");

export const listCourses = (params) => API.get("/courses", { params });
export const createCourse = (data) => API.post("/courses", data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

export const listFeedback = (params) => API.get("/feedback", { params });
export const updateFeedback = (id, data) => API.patch(`/feedback/${id}`, data);

export const listActivity = (params) => API.get("/activity", { params });
export const getSystemStatus = () => API.get("/system");
export const getNotifications = () => API.get("/notifications");
export const getReports = (params) => API.get("/reports", { params });
export const getJobSearchActivity = (params) => API.get("/activity/job-searches", { params });

export default API;
