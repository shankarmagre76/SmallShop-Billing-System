/**
 * Extracts a user-friendly error message from an API response or error object.
 * @param {Error|object} error - The caught Axios error or response object.
 * @returns {string} Clean error message.
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";

  // If server responded with a structured ErrorResponse from backend
  if (error.response) {
    const { status, data } = error.response;

    if (data && data.message) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return `${data.message} (${data.errors.join("; ")})`;
      }
      return data.message;
    }

    switch (status) {
      case 400:
        return "Invalid request data. Please check your inputs.";
      case 401:
        return "Authentication required. Please log in again.";
      case 403:
        return "Access denied. You do not have permission for this operation.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "A conflict occurred (e.g. duplicate item or concurrency issue).";
      case 500:
        return "A server error occurred. Please try again later.";
      default:
        return `Request failed with status code ${status}.`;
    }
  }

  // Network or connection error
  if (error.request) {
    return "Unable to connect to the backend server. Please verify your network and backend status.";
  }

  return error.message || "An unexpected error occurred.";
};
