import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";
import useLocalStorage from "../hooks/useLocalStorage";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [token, setToken] = useLocalStorage("token", null);
  const [loading, setLoading] = useState(false);

  // Keep axios header in sync with token
  useEffect(() => {
    if (token) {
      authService.setToken(token);
    } else {
      authService.removeToken();
    }
  }, [token]);

  // Restore user from token on refresh
  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error("Failed to restore user:", err);
          logout(); // invalid token → force logout
        }
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);

      setUser(response.user);
      setToken(response.token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);

      // OPTIONAL: auto-login after register
      setUser(response.user);
      setToken(response.token);

      return {
        success: true,
        message: response.message || "Registration successful",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    authService.removeToken();
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      await authService.updatePassword(passwordData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Password update failed",
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updatePassword,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    isStoreOwner: user?.role === "store_owner",
    isUser: user?.role === "user",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
