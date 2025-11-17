const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const {
  handleValidationErrors,
  validateUniqueEmail,
  sanitizeInput,
} = require("../middleware/validation");

const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
} = require("../utils/validators");

// Sanitize all incoming fields
router.use(sanitizeInput);

// REGISTER
router.post(
  "/register",
  registerValidation, // assignment-specific validations
  handleValidationErrors,
  validateUniqueEmail("user"), // prevent duplicate emails
  authController.register
);

// LOGIN
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  authController.login
);

// GET CURRENT USER
router.get("/me", authenticate, authController.getMe);

// UPDATE PASSWORD
router.put(
  "/update-password",
  authenticate,
  updatePasswordValidation, // includes password strength checks
  handleValidationErrors,
  authController.updatePassword
);

module.exports = router;
