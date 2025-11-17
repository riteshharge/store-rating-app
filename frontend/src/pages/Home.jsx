import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Star, Store, Users, Award } from "lucide-react";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isStoreOwner = user?.role === "store_owner";
  const isNormalUser = user?.role === "user";

  const features = [
    {
      icon: <Store className="h-12 w-12 text-primary-600" />,
      title: "Discover Stores",
      description:
        "Find and explore various stores in your area with detailed information and ratings.",
    },
    {
      icon: <Star className="h-12 w-12 text-primary-600" />,
      title: "Rate & Review",
      description:
        "Share your experiences by rating stores and helping others make informed decisions.",
    },
    {
      icon: <Users className="h-12 w-12 text-primary-600" />,
      title: "Community Driven",
      description:
        "Join a community of users who value honest feedback and quality service.",
    },
    {
      icon: <Award className="h-12 w-12 text-primary-600" />,
      title: "Quality Assurance",
      description: "Trust in verified ratings and reviews from real customers.",
    },
  ];

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          {isAdmin ? (
            <>
              Welcome, System Administrator
              <span className="text-primary-600 block">
                Manage The Platform
              </span>
            </>
          ) : isStoreOwner ? (
            <>
              Welcome Store Owner
              <span className="text-primary-600 block">
                Manage Your Dashboard
              </span>
            </>
          ) : (
            <>
              Find the Best Stores
              <span className="text-primary-600 block">
                Based on Real Ratings
              </span>
            </>
          )}
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {isAdmin
            ? "Access dashboards and manage platform data."
            : isStoreOwner
            ? "Manage your store ratings and activities."
            : "Discover top-rated stores, share your experiences, and help others find quality services in your community."}
        </p>

        {/* Not logged in */}
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/stores" className="btn-secondary text-lg px-8 py-3">
              Browse Stores
            </Link>
          </div>
        )}

        {/* Admin / Store Owner -> Only Dashboard button */}
        {(isAdmin || isStoreOwner) && isAuthenticated && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                if (isAdmin) navigate("/admin/dashboard");
                if (isStoreOwner) navigate("/store-owner/dashboard");
              }}
              className="btn-primary text-lg px-8 py-3"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Normal User Buttons */}
        {isNormalUser && isAuthenticated && (
          <div className="space-y-4 mt-4">
            <p className="text-lg text-gray-700">
              Welcome back, <span className="font-semibold">{user?.name}</span>!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/stores" className="btn-primary text-lg px-8 py-3">
                Browse Stores
              </Link>
              <Link
                to="/my-ratings"
                className="btn-secondary text-lg px-8 py-3"
              >
                My Ratings
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Features + Stats only for NORMAL USER */}
      {isNormalUser && (
        <>
          {/* Features */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center space-y-4">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Stats */}
          <section className="bg-primary-50 rounded-2xl p-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary-600">100+</div>
                <div className="text-gray-600">Stores Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">
                  1,000+
                </div>
                <div className="text-gray-600">Ratings Given</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
