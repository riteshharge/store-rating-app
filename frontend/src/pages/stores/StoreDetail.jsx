import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  User,
  ArrowLeft,
  Phone,
  Globe,
  Clock,
  Edit,
  Share2,
} from "lucide-react";
import RatingStars from "../../components/ratings/RatingStars";
import RatingForm from "../../components/ratings/RatingForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { storeService } from "../../services/storeService";
import { ratingService } from "../../services/ratingService";
import { useAuth } from "../../contexts/AuthContext";
import { Store as StoreIcon } from "lucide-react";

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [store, setStore] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    if (id) {
      loadStoreDetails();
    }
  }, [id]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      setError("");

      // Load store details
      const storeResponse = await storeService.getStoreById(id);
      setStore(storeResponse.store);

      // Load store ratings
      const ratingsResponse = (await storeService.getStoreRatings?.(id)) || {
        ratings: [],
      };
      setRatings(ratingsResponse.ratings || []);

      // Load user's rating if authenticated
      if (isAuthenticated) {
        try {
          const userRatingResponse = await ratingService.getStoreWithUserRating(
            id
          );
          setUserRating(userRatingResponse.store.user_rating);
        } catch (err) {
          // User hasn't rated this store yet
          setUserRating(null);
        }
      }
    } catch (err) {
      setError("Store not found or failed to load store details.");
      console.error("Error loading store details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (rating, comment) => {
    try {
      setLoading(true);

      await ratingService.submitRating({
        store_id: id, // 👈 FIXED (was storeId)
        rating,
        comment,
      });

      setSuccessMessage("Your rating was submitted successfully!");
      setShowRatingForm(false);
      loadStoreDetails();

      setTimeout(() => setSuccessMessage(""), 3000); // auto hide
    } catch (error) {
      console.error("Error submitting rating:", error);
      setSuccessMessage("Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.name,
          text: `Check out ${store.name} on StoreRatings`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Store link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">Store Not Found</h3>
          <p className="mb-4">
            {error || "The store you are looking for does not exist."}
          </p>
          <button onClick={() => navigate("/stores")} className="btn-primary">
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow mb-4 text-center">
          {successMessage}
        </div>
      )}
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/stores")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Stores</span>
        </button>

        <div className="flex-1"></div>

        <button
          onClick={handleShareStore}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Store Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Store Image (placeholder) */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <StoreIcon className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Store Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {store.name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{store.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Owner: {store.owner_name}</span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">
                      {store.average_rating
                        ? Number(store.average_rating).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {store.total_ratings || 0} ratings
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  {userRating ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">Your rating:</span>
                      <RatingStars rating={userRating} />
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Update
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="btn-primary"
                    >
                      Rate This Store
                    </button>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                  state={{ from: `/stores/${id}` }}
                >
                  Login to Rate
                </Link>
              )}

              {/* Store owner actions */}
              {user?.id === store.owner_id && (
                <button className="btn-secondary flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Store</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {["overview", "ratings", "contact"].map((tab) => (
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

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  About This Store
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {store.description ||
                    `Welcome to ${store.name}! Located at ${store.address}, this store is owned and operated by ${store.owner_name}.`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Store Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-700">
                      <User className="h-5 w-5 text-gray-400" />
                      <span>Owner: {store.owner_name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>
                        Joined:{" "}
                        {new Date(store.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Rating Summary</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-4">
                          {stars}
                        </span>

                        <Star className="h-4 w-4 text-yellow-500 fill-current" />

                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width:
                                (store.rating_distribution?.[stars] || 0) > 0
                                  ? "100%"
                                  : "0%",
                            }}
                          ></div>
                        </div>

                        <span className="text-sm text-gray-600 w-8">
                          {store.rating_distribution?.[stars] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Reviews ({ratings.length})
                </h3>
              </div>

              {ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {rating.user_name || "Anonymous User"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <RatingStars rating={rating.rating} />
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 mt-2">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Reviews Yet
                  </h4>
                  <p className="text-gray-600">
                    Be the first to rate this store!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p>{store.address}</p>
                    </div>
                  </div>

                  {store.email && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${store.email}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {store.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {store.phone && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${store.phone}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {store.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p>Map view would be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingForm && (
        <RatingForm
          store={store}
          userRating={userRating}
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingForm(false)}
        />
      )}
    </div>
  );
};

export default StoreDetail;
