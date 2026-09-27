import axios from "axios";
import { getAuth, clearAuth } from "../utils/authStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Validate baseURL & read token from auth storage
axiosClient.interceptors.request.use(
  (config) => {
    if (!config.baseURL) {
      return Promise.reject(
        new Error(
          "Backend API URL (VITE_API_BASE_URL) is not configured in Vercel. Please deploy the ASP.NET Core backend and set VITE_API_BASE_URL."
        )
      );
    }
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
