import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";
import { getAuth, saveAuth, clearAuth } from "../utils/authStorage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  // Initialize auth state from storage on application startup
  useEffect(() => {
    const auth = getAuth();
    if (auth && auth.token && auth.user) {
      setToken(auth.token);
      setUser(auth.user);
      setRole(auth.user.role || null);
    } else {
      clearAuth();
    }
    setLoading(false);

    // Listen for unauthorized 401 events emitted by axiosClient
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials) => {
    const authResponse = await authService.login(credentials);
    const userData = {
      userId: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      role: authResponse.role,
      expiresAt: authResponse.expiresAt,
    };

    saveAuth({
      token: authResponse.token,
      user: userData,
    });

    setToken(authResponse.token);
    setUser(userData);
    setRole(userData.role);
    return authResponse;
  };

  const register = async (registerData) => {
    const authResponse = await authService.register(registerData);
    return authResponse;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
