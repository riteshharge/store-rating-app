import React, { useState, useEffect } from "react";
import {
  Users,
  Store,
  Star,
  Activity,
  UserPlus,
  StoreIcon,
  Eye,
  Calendar,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { userService } from "../../services/userService";
import { storeService } from "../../services/storeService";

import AddUserModal from "../../components/modals/AddUserModal";
import AddStoreModal from "../../components/modals/AddStoreModal";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentStores, setRecentStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
    minRating: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "store_owner":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchUsers = async (extra = {}) => {
    const params = {
      name: userFilters.name || undefined,
      email: userFilters.email || undefined,
      address: userFilters.address || undefined,
      role: userFilters.role || undefined,
      sortBy: "created_at",
      sortOrder: "desc",
      limit: 50,
      ...extra,
    };

    const usersResponse = await userService.getAllUsers(params);
    setRecentUsers(usersResponse.users || []);
  };

  const fetchStores = async (extra = {}) => {
    const params = {
      name: storeFilters.name || undefined,
      email: storeFilters.email || undefined,
      address: storeFilters.address || undefined,
      sortBy: "created_at",
      sortOrder: "desc",
      limit: 50,
      ...extra,
    };

    const storesResponse = await storeService.getAllStores(params);
    let stores = storesResponse.stores || [];

    if (storeFilters.minRating !== "") {
      const min = Number(storeFilters.minRating);
      if (!Number.isNaN(min)) {
        stores = stores.filter((s) => (Number(s.average_rating) || 0) >= min);
      }
    }

    setRecentStores(stores);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await userService.getDashboardStats();
      setStats(statsResponse.stats);
      await Promise.all([fetchUsers(), fetchStores()]);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, stores, and platform analytics
          </p>
        </div>

        <button className="btn-secondary flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Last 30 Days</span>
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadDashboardData}
              className="text-red-700 hover:text-red-800 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>

          <div className="card flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalStores}
              </p>
            </div>
          </div>

          <div className="card flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Ratings</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRatings}
              </p>
            </div>
          </div>

          <div className="card flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">142</p>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {["overview", "users", "stores", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Users
                </h3>
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Stores
                </h3>
                <div className="space-y-3">
                  {recentStores.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <StoreIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {store.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {store.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-600 space-x-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-sm">
                          {Number(store.average_rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>

                <button
                  className="btn-primary flex items-center space-x-2"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="card p-4 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Filter by Name"
                  className="input"
                  value={userFilters.name}
                  onChange={(e) =>
                    setUserFilters((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="Filter by Email"
                  className="input"
                  value={userFilters.email}
                  onChange={(e) =>
                    setUserFilters((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="Filter by Address"
                  className="input"
                  value={userFilters.address}
                  onChange={(e) =>
                    setUserFilters((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />

                <select
                  className="input"
                  value={userFilters.role}
                  onChange={(e) =>
                    setUserFilters((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                </select>

                <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2">
                  <button
                    onClick={() => fetchUsers()}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Apply Filters
                  </button>

                  <button
                    onClick={() => {
                      setUserFilters({
                        name: "",
                        email: "",
                        address: "",
                        role: "",
                      });
                      fetchUsers();
                    }}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* USERS TABLE WITH SCROLLBAR */}
              <div
                className="overflow-x-auto overflow-y-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#3b82f6 #e0e7ff",
                }}
              >
                <table className="w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.name}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.address}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="inline-flex items-center text-primary-600 hover:text-primary-900"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUser && (
                <div className="card mt-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    User Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Name: </span>
                      {selectedUser.name}
                    </p>

                    <p>
                      <span className="font-semibold">Email: </span>
                      {selectedUser.email}
                    </p>

                    <p>
                      <span className="font-semibold">Address: </span>
                      {selectedUser.address}
                    </p>

                    <p>
                      <span className="font-semibold">Role: </span>
                      {selectedUser.role}
                    </p>

                    {selectedUser.role === "store_owner" && (
                      <p>
                        <span className="font-semibold">Store Rating: </span>
                        {selectedUser.store_rating ?? "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STORES TAB */}
          {activeTab === "stores" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Store Management
                </h3>

                <button
                  className="btn-primary flex items-center space-x-2"
                  onClick={() => setShowAddStoreModal(true)}
                >
                  <StoreIcon className="h-4 w-4" />
                  <span>Add Store</span>
                </button>
              </div>

              {/* STORE FILTERS */}
              <div className="card p-4 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Filter by Name"
                  className="input"
                  value={storeFilters.name}
                  onChange={(e) =>
                    setStoreFilters((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="Filter by Email"
                  className="input"
                  value={storeFilters.email}
                  onChange={(e) =>
                    setStoreFilters((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="Filter by Address"
                  className="input"
                  value={storeFilters.address}
                  onChange={(e) =>
                    setStoreFilters((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />

                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="Min Rating"
                  className="input"
                  value={storeFilters.minRating}
                  onChange={(e) =>
                    setStoreFilters((prev) => ({
                      ...prev,
                      minRating: e.target.value,
                    }))
                  }
                />

                <div className="sm:col-span-4 flex justify-end gap-2">
                  <button
                    onClick={() => fetchStores()}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Apply Filters
                  </button>

                  <button
                    onClick={() => {
                      setStoreFilters({
                        name: "",
                        email: "",
                        address: "",
                        minRating: "",
                      });
                      fetchStores();
                    }}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* STORES TABLE */}
              <div className="overflow-x-auto overflow-y-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg scroll-x-blue">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentStores.length > 0 ? (
                      recentStores.map((store) => (
                        <tr key={store.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {store.name}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {store.email || "—"}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {store.address}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            ⭐ {Number(store.average_rating || 0).toFixed(1)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No stores found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS PLACEHOLDER */}
          {activeTab === "analytics" && (
            <div className="text-center text-gray-500 py-10">
              Analytics coming soon...
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={loadDashboardData}
      />

      <AddStoreModal
        isOpen={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;
