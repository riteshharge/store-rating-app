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

// Only admins should manage users
router.use(authenticate);
router.use(authorize("admin"));

// Common middleware
router.use(sanitizeInput);
router.use(validateQueryParams);
router.use(validatePagination);

// Create new user
router.post(
  "/createUser",
  createUserValidation,
  handleValidationErrors,
  validateUniqueEmail("user"),
  validateRole,
  userController.createUser
);

// List all users
router.get("/getAllUsers", userController.getAllUsers);

// Dashboard stats
router.get("/dashboard/stats", userController.getDashboardStats);

// Get specific user
router.get("/getUserById/:id", validateUserExists, userController.getUserById);

router.get(
  "/role/:role",
  authenticate,
  authorize("admin"),
  userController.getUsersByRole
);
module.exports = router;
