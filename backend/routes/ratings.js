const express = require("express");
const router = express.Router();

const ratingController = require("../controllers/ratingController");
const { authenticate, authorize } = require("../middleware/auth");

const {
  handleValidationErrors,
  validatePagination,
  sanitizeInput,
} = require("../middleware/validation");

const { ratingValidation } = require("../utils/validators");

/* ------------------------------------------------------------------
   COMMON MIDDLEWARE
------------------------------------------------------------------- */
router.use(authenticate); // All rating routes require login
router.use(sanitizeInput);
router.use(validatePagination);

/* ------------------------------------------------------------------
   USER: CREATE OR UPDATE RATING
------------------------------------------------------------------- */
router.post(
  "/submitRating",
  authorize("user"),
  ratingValidation, // rating + store_id validation
  handleValidationErrors,
  ratingController.submitRating
);

/* ------------------------------------------------------------------
   USER: GET OWN RATINGS
------------------------------------------------------------------- */
router.get(
  "/getUserRating",
  authorize("user"),
  ratingController.getUserRatings
);

/* ------------------------------------------------------------------
   GET STORE + USER RATING (all roles allowed)
------------------------------------------------------------------- */
router.get(
  "/store/rating/:storeId",
  authorize("user", "store_owner", "admin"),
  ratingController.getStoreWithUserRating
);

/* ------------------------------------------------------------------
   USER: DELETE RATING
------------------------------------------------------------------- */
router.delete(
  "/deleteRating/:ratingId",
  authorize("user"),
  ratingController.deleteRating
);

module.exports = router;
