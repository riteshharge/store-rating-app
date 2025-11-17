import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Store,
  MapPin,
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  MessageSquare,
  Eye,
} from "lucide-react";
import RatingStars from "../../components/ratings/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ratingService } from "../../services/ratingService";
import { useAuth } from "../../contexts/AuthContext";

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [editingRating, setEditingRating] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    loadUserRatings();
  }, []);

  useEffect(() => {
    filterAndSortRatings();
  }, [ratings, searchTerm, ratingFilter, sortBy]);

  const loadUserRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingService.getUserRatings();
      setRatings(response.ratings || []);
    } catch (err) {
      setError("Failed to load your ratings. Please try again later.");
      console.error("Error loading user ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRatings = () => {
    let filtered = [...ratings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.store_name?.toLowerCase().includes(term) ||
          r.store_address?.toLowerCase().includes(term)
      );
    }

    if (ratingFilter !== "all") {
      const ratingValue = parseInt(ratingFilter);
      filtered = filtered.filter((r) => r.rating === ratingValue);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "store_name":
          return (a.store_name || "").localeCompare(b.store_name || "");
        default:
          return 0;
      }
    });

    setFilteredRatings(filtered);
  };

  // ⭐ UPDATE RATING
  const handleUpdateRating = async (ratingId, newRating) => {
    try {
      const rating = ratings.find((r) => r.id === ratingId);
      if (!rating) return;

      await ratingService.submitRating({
        store_id: rating.store_id,
        rating: newRating,
      });

      setRatings((prev) =>
        prev.map((r) => (r.id === ratingId ? { ...r, rating: newRating } : r))
      );

      setEditingRating(null);
      setEditRatingValue(0);
    } catch (err) {
      console.error("Error updating rating:", err);
      setError("Failed to update rating. Please try again.");
    }
  };

  // ❌ DELETE RATING (FIXED)
  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;

    try {
      await ratingService.deleteRating(ratingId);

      setRatings((prev) => prev.filter((r) => r.id !== ratingId));
    } catch (err) {
      console.error("Error deleting rating:", err);
      setError("Failed to delete rating. Please try again.");
    }
  };

  const startEditing = (rating) => {
    setEditingRating(rating.id);
    setEditRatingValue(rating.rating);
  };

  const cancelEditing = () => {
    setEditingRating(null);
    setEditRatingValue(0);
  };

  const getRatingStats = () => {
    const total = ratings.length;
    const average =
      total > 0
        ? (ratings.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
        : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => distribution[r.rating]++);

    return { total, average, distribution };
  };

  const stats = getRatingStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ratings</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your store ratings
          </p>
        </div>
        <Link to="/stores" className="btn-primary">
          Browse More Stores
        </Link>
      </div>

      {/* Stats */}
      {ratings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-600">Total Ratings</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">{stats.average}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">
              {Math.max(...Object.values(stats.distribution))}
            </div>
            <div className="text-gray-600">Most Given</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">
              {ratings.length > 0
                ? new Date(
                    Math.max(...ratings.map((r) => new Date(r.created_at)))
                  ).toLocaleDateString()
                : "N/A"}
            </div>
            <div className="text-gray-600">Last Rated</div>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search your rated stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="store_name">Store Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between">
            <span>{error}</span>
            <button
              onClick={loadUserRatings}
              className="text-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {filteredRatings.length > 0 ? (
        <div className="space-y-4">
          {filteredRatings.map((rating) => (
            <div key={rating.id} className="card hover:shadow-md transition">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Store Info */}
                <div className="flex-1">
                  <div className="flex justify-between mb-3">
                    <div>
                      <Link to={`/stores/${rating.store_id}`} className="group">
                        <h3 className="text-xl font-semibold group-hover:text-primary-600">
                          {rating.store_name}
                        </h3>
                      </Link>

                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{rating.store_address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Rated on{" "}
                            {new Date(rating.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Controls */}
                    <div className="flex flex-col items-end space-y-2">
                      {editingRating === rating.id ? (
                        <div className="text-center">
                          <RatingStars
                            rating={editRatingValue}
                            onRatingChange={setEditRatingValue}
                            interactive={true}
                            size="md"
                          />
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() =>
                                handleUpdateRating(rating.id, editRatingValue)
                              }
                              disabled={editRatingValue === 0}
                              className="text-sm text-green-600 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-sm text-gray-600 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-center">
                            <RatingStars rating={rating.rating} size="md" />
                            <div className="text-sm text-gray-600 mt-1">
                              {rating.rating} star
                              {rating.rating !== 1 ? "s" : ""}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(rating)}
                              className="text-primary-600 hover:text-primary-700 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRating(rating.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  {rating.comment && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-3">
                      <div className="flex space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-700 text-sm">
                          {rating.comment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-4 mt-4 pt-3 border-t">
                    <Link
                      to={`/stores/${rating.store_id}`}
                      className="flex items-center text-primary-600"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View Store
                    </Link>

                    {rating.store_owner_response && (
                      <div className="flex items-center text-green-600">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Owner Responded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {ratings.length === 0 ? (
            <>
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Ratings Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't rated any stores yet.
              </p>
              <Link to="/stores" className="btn-primary">
                Browse Stores
              </Link>
            </>
          ) : (
            <>
              <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Matching Ratings</h3>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRatingFilter("all");
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Rating Distribution */}
      {ratings.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Your Rating Distribution
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars];
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={stars} className="flex items-center space-x-3">
                  <div className="flex items-center w-16">
                    <span className="text-sm w-4">{stars}</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>

                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center w-20">
                    <span className="text-sm">{count}</span>
                    <span className="text-sm text-gray-400">
                      ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRatings;
