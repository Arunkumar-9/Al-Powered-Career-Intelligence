import axios from "axios";
import { API_ORIGIN } from "./apiConfig";

const API = axios.create({
  baseURL: `${API_ORIGIN}/api/auth`,
});

export const registerUser = (userData) => {
  return API.post("/register", userData);
};

export const loginUser = (userData) => {
  return API.post("/login", userData);
};
