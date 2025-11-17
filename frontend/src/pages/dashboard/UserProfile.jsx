import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Star,
  Store,
  Settings,
  Bell,
  Lock,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { authService } from "../../services/authService";
import { ratingService } from "../../services/ratingService";

const UserProfile = () => {
  const { user, updatePassword, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  // Auto clear notifications
  const autoClear = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 2000);
  };

  useEffect(() => {
    if (user) loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userResponse = await authService.getCurrentUser(token);

      setProfile(userResponse);
      setEditForm(userResponse);

      // Load ratings ONLY for normal user
      if (userResponse.role === "user") {
        const ratingsResponse = await ratingService.getUserRatings();
        setRatings(ratingsResponse.ratings || []);
      } else {
        setRatings([]);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load profile data.");
      autoClear();
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSuccess("Profile updated successfully!");
    autoClear();
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await updatePassword({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.password,
      });

      if (!response?.success) {
        setError(response?.error || "Failed to update password.");
        autoClear();
        return;
      }

      if (passwordForm.password !== passwordForm.confirmPassword) {
        setError("New passwords do not match.");
        autoClear();
        return;
      }

      setSuccess("Password updated successfully!");

      setPasswordForm({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });

      autoClear();
    } catch (err) {
      setError("Failed to update password.");
      autoClear();
    }
  };

  const cancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return {
          label: "Administrator",
          color: "bg-purple-100 text-purple-800",
        };
      case "store_owner":
        return { label: "Store Owner", color: "bg-blue-100 text-blue-800" };
      default:
        return { label: "User", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Profile Not Found
        </h3>
        <p className="text-gray-600">Unable to load user profile.</p>
      </div>
    );
  }

  const roleInfo = getRoleDisplay(profile.role);
  const isNormalUser = profile.role === "user";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="card space-y-1">
            {/* Profile */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                activeTab === "profile"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>

            {/* Security */}
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                activeTab === "security"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </button>

            {/* My Activity — ONLY for normal users */}
            {isNormalUser && (
              <button
                onClick={() => setActiveTab("activity")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                  activeTab === "activity"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Star className="h-4 w-4" />
                <span>My Activity</span>
              </button>
            )}

            {/* Preferences */}
            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                activeTab === "preferences"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </button>
          </div>

          {/* QUICK STATS */}
          <div className="card mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>

            <div className="space-y-3">
              {/* Total Ratings ONLY for normal user */}
              {isNormalUser && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Ratings</span>
                  <span className="font-medium">{ratings.length}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-medium">
                  {new Date(profile.created_at).getFullYear()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Role</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        className="btn-primary flex items-center"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </button>
                    </div>
                  )}
                </div>

                {/* PROFILE FORM */}
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="label">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Address</label>
                    <textarea
                      value={editForm.address || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      disabled={!isEditing}
                      rows="3"
                      className="input-field disabled:bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Role</label>
                      <div className="p-2 bg-gray-50 rounded-lg flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{roleInfo.label}</span>
                      </div>
                    </div>

                    <div>
                      <label className="label">Member Since</label>
                      <div className="p-2 bg-gray-50 rounded-lg flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Security Settings</h2>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            password: e.target.value,
                          })
                        }
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary">
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* MY ACTIVITY — ONLY NORMAL USER */}
            {activeTab === "activity" && isNormalUser && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">My Activity</h2>

                <div className="space-y-4">
                  {ratings.length > 0 ? (
                    ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="p-4 bg-gray-50 rounded-lg flex space-x-3"
                      >
                        <Store className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <h4 className="font-medium">{rating.store_name}</h4>

                          <div className="flex items-center space-x-2 mt-1">
                            {/* Stars */}
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= rating.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}

                            {/* Date */}
                            <span className="text-sm text-gray-500">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {rating.comment && (
                            <p className="text-sm text-gray-700 mt-2">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium">No Ratings Yet</h4>
                      <p className="text-gray-600">
                        Start rating stores to see your activity here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Preferences</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">
                          Receive updates about your ratings and activity
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-gray-600">
                          Receive promotional offers and updates
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* END MAIN CARD */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
