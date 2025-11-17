const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const {
  handleValidationErrors,
  validateUniqueEmail,
  validateNameLength,
  validateAddressLength,
  sanitizeInput,
} = require("../middleware/validation");

const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
} = require("../utils/validators");

// Sanitize all incoming fields
router.use(sanitizeInput);

/* ===========================
   REGISTER
=========================== */
router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  validateUniqueEmail("user"),
  authController.register
);

/* ===========================
   LOGIN
=========================== */
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  authController.login
);

/* ===========================
   GET CURRENT USER
=========================== */
router.get("/me", authenticate, authController.getMe);

/* ===========================
   UPDATE PROFILE  ← (NEW)
=========================== */
router.put(
  "/update-profile",
  authenticate,
  validateNameLength,
  validateAddressLength,
  handleValidationErrors,
  authController.updateProfile
);

/* ===========================
   UPDATE PASSWORD
=========================== */
router.put(
  "/update-password",
  authenticate,
  updatePasswordValidation,
  handleValidationErrors,
  authController.updatePassword
);

module.exports = router;
