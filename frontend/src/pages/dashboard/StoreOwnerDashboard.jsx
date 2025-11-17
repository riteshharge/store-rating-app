import React, { useState, useEffect } from "react";
import {
  Store,
  Star,
  Users,
  TrendingUp,
  MessageSquare,
  Eye,
  Edit,
  Share2,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { storeService } from "../../services/storeService";
import { ratingService } from "../../services/ratingService";
const StoreOwnerDashboard = () => {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);

      // Load store owner dashboard data
      const response = await storeService.getStoreOwnerDashboard();
      setStore(response.store);
      setRatings(response.ratings || []);
    } catch (err) {
      setError("Failed to load store data. Please try again later.");
      console.error("Error loading store data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating) => {
      distribution[rating.rating]++;
    });
    return distribution;
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const getRecentActivity = () => {
    // Sort ratings by date and get latest 5
    return [...ratings]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Store Found
        </h3>
        <p className="text-gray-600 mb-6">
          You don't have a store registered yet. Please contact admin to set up
          your store.
        </p>
        <button className="btn-primary">Contact Admin</button>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const averageRating = getAverageRating();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your store performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          <button className="btn-secondary flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadStoreData}
              className="text-red-700 hover:text-red-800 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Store Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Info Card */}
        <div className="card lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
              <p className="text-gray-600 mt-1">{store.address}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {averageRating}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {ratings.length}
              </div>
              <div className="text-sm text-gray-600">Total Ratings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {ratingDistribution[5]}
              </div>
              <div className="text-sm text-gray-600">5 Star Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {ratingDistribution[1] + ratingDistribution[2]}
              </div>
              <div className="text-sm text-gray-600">Needs Attention</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Rating Trend</span>
              </div>
              <span className="text-sm font-medium text-green-600">+12%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">New Reviews</span>
              </div>
              <span className="text-sm font-medium text-blue-600">
                +5 this week
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Store Views</span>
              </div>
              <span className="text-sm font-medium text-purple-600">+23%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">Response Rate</span>
              </div>
              <span className="text-sm font-medium text-orange-600">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {["overview", "ratings", "analytics", "responses"].map((tab) => (
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
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingDistribution[stars];
                    const percentage =
                      ratings.length > 0 ? (count / ratings.length) * 100 : 0;

                    return (
                      <div key={stars} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm text-gray-600 w-4">
                            {stars}
                          </span>
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>

                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              count > 0
                                ? "bg-yellow-500 w-full"
                                : "bg-gray-200 w-0"
                            }`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((rating) => (
                      <div
                        key={rating.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {rating.user_name || "Anonymous"}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
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
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  rating.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Ratings
                </h3>
                <div className="flex space-x-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>All Ratings</option>
                    <option>5 Stars</option>
                    <option>4 Stars</option>
                    <option>3 Stars</option>
                    <option>2 Stars</option>
                    <option>1 Star</option>
                  </select>
                </div>
              </div>

              {/* Ratings List */}
              <div className="space-y-4">
                {ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <div key={rating.id} className="card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {rating.user_name || "Anonymous User"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(rating.created_at).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(rating.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rating.comment && (
                        <p className="text-gray-700 mb-3">{rating.comment}</p>
                      )}

                      <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                        <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                          <MessageSquare className="h-4 w-4" />
                          <span>Respond</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium">
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Ratings Yet
                    </h4>
                    <p className="text-gray-600">
                      Customer ratings will appear here once they start rating
                      your store.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rating Trends
                  </h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Rating trends chart would be displayed here
                    </p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customer Insights
                  </h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Customer insights chart would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "responses" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Responses
                </h3>
                <div className="text-sm text-gray-600">
                  {ratings.filter((r) => !r.owner_response).length} pending
                  responses
                </div>
              </div>

              <div className="space-y-4">
                {ratings.filter((r) => !r.owner_response).length > 0 ? (
                  ratings
                    .filter((rating) => !rating.owner_response)
                    .map((rating) => (
                      <div key={rating.id} className="card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= rating.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                by {rating.user_name || "Anonymous"}
                              </span>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700">{rating.comment}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <textarea
                            placeholder="Write your response..."
                            rows="2"
                            className="flex-1 input-field"
                          />
                          <button className="btn-primary self-end">
                            Send Response
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      All Caught Up!
                    </h4>
                    <p className="text-gray-600">
                      You have responded to all customer ratings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
