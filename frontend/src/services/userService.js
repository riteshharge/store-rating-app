import api from "./api";

export const userService = {
  /**
   * Create a new user (admin only)
   */
  async createUser(userData) {
    const response = await api.post("/users/createUser", userData);
    return response.data;
  },

  /**
   * Get all users with optional filtering and pagination (admin only)
   */
  async getAllUsers(filters = {}) {
    const response = await api.get("/users/getAllUsers", { params: filters });
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   */
  async getUserById(id) {
    const response = await api.get(`/users/getUserById/${id}`);
    return response.data;
  },

  /**
   * Get dashboard statistics (admin only)
   */
  async getDashboardStats() {
    const response = await api.get("/users/dashboard/stats");
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return response.data;
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId, role) {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Search users by name or email
   */
  async searchUsers(query, filters = {}) {
    const response = await api.get("/users/search", {
      params: { query, ...filters },
    });
    return response.data;
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role, filters = {}) {
    const response = await api.get("/users/by-role", {
      params: { role, ...filters },
    });
    return response.data;
  },

  /**
   * Get user activity log (admin only)
   */
  async getUserActivity(userId) {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  },

  /**
   * Bulk create users (admin only)
   */
  async bulkCreateUsers(usersData) {
    const response = await api.post("/users/bulk-create", { users: usersData });
    return response.data;
  },

  /**
   * Export users data (admin only)
   */
  async exportUsers(format = "csv", filters = {}) {
    const response = await api.get("/users/export", {
      params: { format, ...filters },
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Get user statistics for charts (admin only)
   */
  async getUserStats() {
    const response = await api.get("/users/stats/overview");
    return response.data;
  },

  /**
   * Validate user email
   */
  async validateEmail(email) {
    const response = await api.post("/users/validate-email", { email });
    return response.data;
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const response = await api.post("/auth/reset-password", {
      token,
      password: newPassword,
    });
    return response.data;
  },

  /**
   * Verify email address
   */
  async verifyEmail(token) {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    const response = await api.get("/users/me/preferences");
    return response.data;
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences) {
    const response = await api.put("/users/me/preferences", preferences);
    return response.data;
  },

  /**
   * Upload user profile picture
   */
  async uploadProfilePicture(userId, imageFile) {
    const formData = new FormData();
    formData.append("avatar", imageFile);

    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete user profile picture
   */
  async deleteProfilePicture(userId) {
    const response = await api.delete(`/users/${userId}/avatar`);
    return response.data;
  },

  /**
   * Get user notifications
   */
  async getNotifications() {
    const response = await api.get("/users/me/notifications");
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    const response = await api.patch(
      `/users/me/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead() {
    const response = await api.patch("/users/me/notifications/read-all");
    return response.data;
  },

  /**
   * Clear all notifications
   */
  async clearNotifications() {
    const response = await api.delete("/users/me/notifications");
    return response.data;
  },

  /**
   * Get user sessions
   */
  async getUserSessions() {
    const response = await api.get("/users/me/sessions");
    return response.data;
  },

  /**
   * Revoke user session
   */
  async revokeSession(sessionId) {
    const response = await api.delete(`/users/me/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions() {
    const response = await api.delete("/users/me/sessions");
    return response.data;
  },

  /**
   * Check if user exists by email
   */
  async checkUserExists(email) {
    try {
      const response = await api.head("/users/check-email", {
        params: { email },
      });
      return { exists: true };
    } catch (error) {
      if (error.response?.status === 404) {
        return { exists: false };
      }
      throw error;
    }
  },

  /**
   * Get user audit log (admin only)
   */
  async getUserAuditLog(userId, filters = {}) {
    const response = await api.get(`/users/${userId}/audit-log`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Lock/Unlock user account (admin only)
   */
  async setUserAccountLock(userId, locked, reason = "") {
    const response = await api.patch(`/users/${userId}/lock`, {
      locked,
      reason,
    });
    return response.data;
  },

  /**
   * Get user login history
   */
  async getUserLoginHistory(userId, filters = {}) {
    const response = await api.get(`/users/${userId}/login-history`, {
      params: filters,
    });
    return response.data;
  },

  async getUsersByRole(role) {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },
};

export default userService;
