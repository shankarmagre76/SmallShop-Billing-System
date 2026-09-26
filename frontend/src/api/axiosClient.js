import axios from "axios";
import { getAuth, clearAuth } from "../utils/authStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5206/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Read token from auth storage & attach Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth && auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global 401 Unauthorized & 403 Forbidden status codes
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Clear auth storage and notify application of session expiration
        clearAuth();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
