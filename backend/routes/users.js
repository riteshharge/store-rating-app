const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

const {
  handleValidationErrors,
  validateQueryParams,
  validateUniqueEmail,
  validateRole,
  validateUserExists,
  validatePagination,
  sanitizeInput,
} = require("../middleware/validation");

const { createUserValidation } = require("../utils/validators");

/* ------------------------------------------------------------------
   ONLY ADMIN CAN ACCESS ALL USER MANAGEMENT ROUTES
------------------------------------------------------------------- */
router.use(authenticate);
router.use(authorize("admin"));

/* ------------------------------------------------------------------
   COMMON MIDDLEWARE
------------------------------------------------------------------- */
router.use(sanitizeInput);
router.use(validateQueryParams);
router.use(validatePagination);

/* ------------------------------------------------------------------
   CREATE NEW USER (Admin can create: user, admin, store_owner)
------------------------------------------------------------------- */
router.post(
  "/createUser",
  createUserValidation, // PDF-based validation
  handleValidationErrors,
  validateUniqueEmail("user"), // ensure email not registered
  validateRole, // ensure role is valid
  userController.createUser
);

/* ------------------------------------------------------------------
   LIST ALL USERS
------------------------------------------------------------------- */
router.get("/getAllUsers", userController.getAllUsers);

/* ------------------------------------------------------------------
   DASHBOARD STATS (total users, owners, ratings etc.)
------------------------------------------------------------------- */
router.get("/dashboard/stats", userController.getDashboardStats);

/* ------------------------------------------------------------------
   GET USER BY ID
------------------------------------------------------------------- */
router.get("/getUserById/:id", validateUserExists, userController.getUserById);

/* ------------------------------------------------------------------
   GET USERS BY ROLE (admin only)
------------------------------------------------------------------- */
router.get("/role/:role", userController.getUsersByRole);

module.exports = router;
