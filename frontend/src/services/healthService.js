import axios from "axios";

/**
 * Checks backend health status.
 * Note: Uses raw axios to call /health without requiring /api prefix or JWT token.
 */
export const getHealthCheck = async () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  // Remove /api suffix to reach root /health
  const rootUrl = apiBase.replace(/\/api\/?$/, "");

  try {
    const response = await axios.get(`${rootUrl}/health`, { timeout: 5000 });
    return {
      connected: response.status === 200,
      data: response.data,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};
