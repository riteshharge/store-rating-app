const express = require("express");
const router = express.Router();

const ratingController = require("../controllers/ratingController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  handleValidationErrors,
  validateRating,
  validateStoreOwnership,
  validatePagination,
  sanitizeInput,
} = require("../middleware/validation");

const { ratingValidation } = require("../utils/validators");

// Common middleware
router.use(authenticate);
router.use(sanitizeInput);
router.use(validatePagination);

// Submit or update rating
router.post(
  "/submitRating",
  authorize("user"),
  ratingValidation,
  handleValidationErrors,
  validateRating,
  validateStoreOwnership,
  ratingController.submitRating
);

// Get logged-in user's ratings
router.get(
  "/getUserRating",
  authorize("user"),
  ratingController.getUserRatings
);

// Get a specific store along with user's rating
router.get(
  "/store/rating/:storeId",
  authorize("user", "store_owner", "admin"),
  ratingController.getStoreWithUserRating
);

router.delete(
  "/deleteRating/:ratingId",
  authorize("user"),
  ratingController.deleteRating
);

module.exports = router;
