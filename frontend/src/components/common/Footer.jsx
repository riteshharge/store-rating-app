import React from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
  Heart,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    // FULLY COMPATIBLE SCROLL FIX FOR ALL BROWSERS
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quick links (Stores removed)
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Privacy, Terms, Support all in ONE COLUMN
  const generalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Support", path: "/support" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "#",
      color: "hover:text-blue-600",
    },
    { name: "Twitter", icon: Twitter, url: "#", color: "hover:text-blue-400" },
    {
      name: "Instagram",
      icon: Instagram,
      url: "#",
      color: "hover:text-pink-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "#",
      color: "hover:text-blue-700",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Store className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">StoreRatings</span>
            </Link>

            <p className="text-gray-400 leading-relaxed mb-4">
              Helping you discover reliable stores with real customer reviews.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map(({ name, icon: Icon, url, color }) => (
                <a
                  key={name}
                  href={url}
                  className={`text-gray-400 hover:text-white ${color} transition-colors`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ name, path }) => (
                <li key={name}>
                  <Link
                    to={path}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy + Terms + Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              {generalLinks.map(({ name, path }) => (
                <li key={name}>
                  <Link
                    to={path}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-10 pt-8 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <a
                href="mailto:help.storeratings@gmail.com"
                className="text-white hover:text-primary-400"
              >
                help.storeratings@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <a
                href="tel:+919876543210"
                className="text-white hover:text-primary-400"
              >
                +1 (555) 123-4567
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-white">
                125 Market Street, Suite 200 San Francisco, CA 94105, USA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 flex items-center space-x-2">
            <span>© {currentYear} StoreRatings</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>by Ritesh Harge</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
