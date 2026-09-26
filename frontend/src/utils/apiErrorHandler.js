/**
 * Centralized API Error Handling Utility
 * Converts backend HTTP error responses into clean, user-friendly messages.
 * Never exposes SQL errors, stack traces, or raw exception details.
 */
export const formatApiError = (error, defaultMessage = "An unexpected error occurred.") => {
  if (!error) return defaultMessage;

  // Server HTTP Response Error
  if (error.response) {
    const { status, data } = error.response;

    // Structured backend ErrorResponse payload { statusCode, message, errors }
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
        return "Your session has expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "The data has changed. Please refresh and try again.";
      case 422:
        return "Validation failed. Please verify the entered information.";
      case 500:
        return "Something went wrong on the server.";
      default:
        return `Request failed with status code ${status}.`;
    }
  }

  // Connection / Network Timeout Error
  if (error.request) {
    return "Unable to connect to the server. Please verify network and API status.";
  }

  return error.message || defaultMessage;
};
