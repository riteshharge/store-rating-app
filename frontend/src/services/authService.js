// src/services/authService.js
import api from "./api";

export const authService = {
  // Save token in both axios + localStorage
  setToken(token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  // Clear token everywhere
  removeToken() {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  },

  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });

    // Auto-save + attach token
    this.setToken(response.data.token);

    // You also return user here; AuthContext will save it into localStorage
    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData);

    // Auto-save + attach token (if you want auto-login after registration)
    this.setToken(response.data.token);

    return response.data;
  },

  async updatePassword(passwordData) {
    const response = await api.put("/auth/update-password", passwordData);
    return response.data;
  },

  async getCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    // Ensure axios has token
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const response = await api.get("/auth/me");

    return response.data;
  },
};
