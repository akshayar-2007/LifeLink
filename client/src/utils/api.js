import axios from "axios";

// Base URL of our backend
// process.env allows different URLs for
// development and production
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

// REQUEST INTERCEPTOR
// Runs before EVERY API call automatically
// Adds token to header so we don't have to
// manually add it in every component
API.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // If token exists add to Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// RESPONSE INTERCEPTOR
// Runs after every API response
// If token expired → auto logout
API.interceptors.response.use(
  (response) => response,  // success → return response
  (error) => {
    // If 401 Unauthorized → token expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;