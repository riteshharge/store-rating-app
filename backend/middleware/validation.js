const { validationResult } = require("express-validator");

// Handle express-validator errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

// Validate sorting, pagination & filter values
const validateQueryParams = (req, res, next) => {
  const { sortOrder, page, limit, ...filters } = req.query;

  if (sortOrder && !["asc", "desc"].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({ error: 'sortOrder must be "asc" or "desc"' });
  }

  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: "page must be a positive number" });
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ error: "limit must be between 1 and 100" });
  }

  // Basic SQL-injection prevention for filter values
  const blockedPattern = /[;\\'"-]/;
  for (const value of Object.values(filters)) {
    if (value && blockedPattern.test(value)) {
      return res
        .status(400)
        .json({ error: "Invalid characters in filter values" });
    }
  }

  next();
};

// Validate 1–5 rating
const validateRating = (req, res, next) => {
  const { rating } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  next();
};

// Validate role correctness
const validateRole = (req, res, next) => {
  const { role } = req.body;

  if (role && !["admin", "user", "store_owner"].includes(role)) {
    return res.status(400).json({
      error: "Role must be one of: admin, user, store_owner",
    });
  }

  next();
};

// Validate unique email for user/store
const validateUniqueEmail = (type) => {
  return async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return next();

      let existing = null;

      if (type === "user") {
        const User = require("../models/User");
        existing = await User.findByEmail(email);
      } else if (type === "store") {
        const Store = require("../models/Store");
        existing = await Store.findByEmail(email);
      }

      if (existing) {
        return res.status(400).json({
          error: `${type} with this email already exists`,
        });
      }

      next();
    } catch (err) {
      console.error("Email validation error:", err);
      res.status(500).json({ error: "Email validation failed" });
    }
  };
};

// Validate store belongs to logged-in owner (if owner)
const validateStoreOwnership = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.store_id;
    const userId = req.user.id;

    if (!storeId) return next();

    const Store = require("../models/Store");
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (req.user.role === "store_owner" && store.owner_id !== userId) {
      return res.status(403).json({
        error: "You can only access your own store",
      });
    }

    req.store = store;
    next();
  } catch (err) {
    console.error("Store ownership validation error:", err);
    res.status(500).json({ error: "Store validation failed" });
  }
};

// Validate if user exists for given ID
const validateUserExists = async (req, res, next) => {
  try {
    const userId = req.params.id || req.body.owner_id;
    if (!userId) return next();

    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    req.targetUser = user;
    next();
  } catch (err) {
    console.error("User existence validation error:", err);
    res.status(500).json({ error: "User validation failed" });
  }
};

// Check password strength
const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;

  if (!password) return next();

  const strongPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;

  if (!strongPassword.test(password)) {
    return res.status(400).json({
      error:
        "Password must be 8-16 chars, contain 1 uppercase letter & 1 special character",
    });
  }

  next();
};

// Validate name length
const validateNameLength = (req, res, next) => {
  const { name } = req.body;

  if (name && (name.length < 3 || name.length > 60)) {
    return res.status(400).json({
      error: "Name must be between 3 and 60 characters",
    });
  }

  next();
};

// Validate address length
const validateAddressLength = (req, res, next) => {
  const { address } = req.body;

  if (address && address.length > 400) {
    return res.status(400).json({
      error: "Address cannot exceed 400 characters",
    });
  }

  next();
};

// Standard input sanitizing
const sanitizeInput = (req, res, next) => {
  const clean = (value) => {
    return typeof value === "string"
      ? value.trim().replace(/\s+/g, " ")
      : value;
  };

  if (req.body) {
    Object.keys(req.body).forEach((k) => {
      req.body[k] = clean(req.body[k]);
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((k) => {
      req.query[k] = clean(req.query[k]);
    });
  }

  next();
};

// Pagination defaults
const validatePagination = (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};

// Prevent self-delete or self-role-change
const validateSelfAction = (req, res, next) => {
  const targetId = req.params.id;
  const currentId = req.user.id;

  if (targetId && Number(targetId) === Number(currentId)) {
    return res.status(400).json({
      error: "You cannot perform this action on your own account",
    });
  }

  next();
};

module.exports = {
  handleValidationErrors,
  validateQueryParams,
  validateRating,
  validateRole,
  validateUniqueEmail,
  validateStoreOwnership,
  validateUserExists,
  validatePasswordStrength,
  validateNameLength,
  validateAddressLength,
  sanitizeInput,
  validatePagination,
  validateSelfAction,
};
