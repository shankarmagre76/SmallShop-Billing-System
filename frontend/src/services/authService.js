import axiosClient from "../api/axiosClient";

/**
 * Registers a new staff user.
 * @param {Object} registerData - { fullName, email, password }
 * @returns {Promise<Object>} - AuthResponse { token, userId, fullName, email, role, expiresAt }
 */
export const register = async (registerData) => {
  const response = await axiosClient.post("/Auth/register", {
    fullName: registerData.fullName,
    email: registerData.email,
    password: registerData.password,
  });
  return response.data;
};

/**
 * Authenticates user credentials.
 * @param {Object} loginData - { email, password }
 * @returns {Promise<Object>} - AuthResponse { token, userId, fullName, email, role, expiresAt }
 */
export const login = async (loginData) => {
  const response = await axiosClient.post("/Auth/login", {
    email: loginData.email,
    password: loginData.password,
  });
  return response.data;
};
