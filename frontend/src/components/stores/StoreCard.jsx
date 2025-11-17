import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, User } from "lucide-react";
import RatingStars from "../ratings/RatingStars";

const StoreCard = ({ store, viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="card hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {store.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{store.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{store.owner_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>
                      {store.average_rating
                        ? Number(store.average_rating).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {store.total_ratings || 0} ratings
                  </div>
                </div>

                <Link
                  to={`/stores/${store.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 truncate">
          {store.name}
        </h3>
        <div className="flex items-center space-x-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span>
            {store.average_rating
              ? Number(store.average_rating).toFixed(1)
              : "0.0"}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm truncate">{store.address}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span className="text-sm">Owner: {store.owner_name}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {store.total_ratings || 0} ratings
        </div>

        <Link
          to={`/stores/${store.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default StoreCard;
