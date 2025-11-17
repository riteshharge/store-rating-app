const express = require("express");
const router = express.Router();

const storeController = require("../controllers/storeController");
const ratingController = require("../controllers/ratingController");

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

/* ------------------------------------------------------------------
   COMMON MIDDLEWARE
------------------------------------------------------------------- */
router.use(sanitizeInput);
router.use(validateQueryParams);
router.use(validatePagination);

/* ------------------------------------------------------------------
   PUBLIC ROUTES
------------------------------------------------------------------- */
router.get("/getAllStores", storeController.getAllStores);

router.get("/getStoreById/:id", storeController.getStoreById);

/* ------------------------------------------------------------------
   GET ALL RATINGS FOR A STORE (public)
------------------------------------------------------------------- */
router.get("/:storeId/ratings", ratingController.getStoreRatings);

/* ------------------------------------------------------------------
   ADMIN: CREATE A NEW STORE
------------------------------------------------------------------- */
router.post(
  "/create-store",
  authenticate,
  authorize("admin"),
  createStoreValidation, // Validate name/email/address/owner_id
  handleValidationErrors,
  validateUniqueEmail("store"), // store email must be unique
  validateUserExists, // checks if owner_id exists in users table
  storeController.createStore
);

/* ------------------------------------------------------------------
   STORE OWNER DASHBOARD
------------------------------------------------------------------- */
router.get(
  "/owner/dashboard",
  authenticate,
  authorize("store_owner"),
  storeController.getStoreOwnerDashboard
);

module.exports = router;
