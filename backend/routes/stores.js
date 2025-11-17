const express = require("express");
const router = express.Router();

const storeController = require("../controllers/storeController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  handleValidationErrors,
  validateQueryParams,
  validateUniqueEmail,
  validateUserExists,
  validatePagination,
  sanitizeInput,
} = require("../middleware/validation");

const { createStoreValidation } = require("../utils/validators");
const ratingController = require("../controllers/ratingController");
// Common middlewares for all routes
router.use(sanitizeInput);
router.use(validateQueryParams);
router.use(validatePagination);

// Public routes
router.get("/getAllStores", storeController.getAllStores);
router.get("/getStoreById/:id", storeController.getStoreById);

// Admin: create store
router.post(
  "/create-store",
  authenticate,
  authorize("admin"),
  createStoreValidation,
  handleValidationErrors,
  validateUniqueEmail("store"),
  validateUserExists,
  storeController.createStore
);

router.get("/:storeId/ratings", ratingController.getStoreRatings);

// Store owner: dashboard
router.get(
  "/owner/dashboard",
  authenticate,
  authorize("store_owner"),
  storeController.getStoreOwnerDashboard
);

module.exports = router;
