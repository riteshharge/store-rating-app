const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    // axios sends lowercase "authorization"
    const header = req.headers.authorization || req.headers.Authorization;

    if (!header) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // Expected format: "Bearer token"
    const token = header.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ error: "Invalid token format." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // payload = { id: userId }
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Access denied. You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
