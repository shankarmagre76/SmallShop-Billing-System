const AUTH_KEY = "smallshop_auth";

/**
 * Saves authentication payload to localStorage safely.
 * @param {Object} authData - { token, user: { userId, fullName, email, role, expiresAt } }
 */
export const saveAuth = (authData) => {
  try {
    if (!authData || !authData.token) return;
    const payload = JSON.stringify({
      token: authData.token,
      user: authData.user || null,
    });
    localStorage.setItem(AUTH_KEY, payload);
  } catch (error) {
    console.error("Failed to save auth data to localStorage:", error);
  }
};

/**
 * Retrieves authentication data from localStorage.
 * @returns {Object|null} - { token, user } or null if absent/malformed
 */
export const getAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.token) {
      clearAuth();
      return null;
    }
    return parsed;
  } catch (error) {
    clearAuth();
    return null;
  }
};

/**
 * Clears authentication data from localStorage.
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error("Failed to clear auth data from localStorage:", error);
  }
};
