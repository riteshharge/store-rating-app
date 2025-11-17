import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Store, User, LogOut, Menu } from "lucide-react";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="w-10/12 mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary-600 hover:opacity-90 transition"
          >
            <Store className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">
              StoreRatings
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 font-medium">
            {/* 🔥 SHOW STORES ONLY FOR NORMAL USER OR NOT LOGGED IN */}
            {(!isAuthenticated || user?.role === "user") && (
              <Link
                to="/stores"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Stores
              </Link>
            )}

            {isAuthenticated && user ? (
              <>
                {/* 🔥 My Ratings -> ONLY for Normal User */}
                {user.role === "user" && (
                  <Link
                    to="/my-ratings"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    My Ratings
                  </Link>
                )}

                {/* 🔥 Admin Dashboard Link */}
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {/* 🔥 Store Owner Dashboard Link */}
                {(user.role === "store_owner" ||
                  user.role === "storeowner") && (
                  <Link
                    to="/store-owner/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    My Store
                  </Link>
                )}

                {/* Profile + Logout */}
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user.name}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="bg-primary-600 hover:bg-primary-700 text-black px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-black px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button (unchanged) */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
