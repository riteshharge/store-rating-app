const { body } = require("express-validator");

/* ------------------------ Common Field Validators ------------------------ */

// User name validator (PDF: 20–60 chars)
const userNameValidator = body("name")
  .trim()
  .isLength({ min: 3, max: 60 })
  .withMessage("Name must be between 3 and 60 characters")
  .matches(/^[A-Za-z ]+$/)
  .withMessage("Name can only contain letters and spaces");

// Store name validator (more realistic)
const storeNameValidator = body("name")
  .isLength({ min: 3, max: 60 })
  .withMessage("Store name must be between 3 and 60 characters");

// Email validator
const emailValidator = body("email")
  .isEmail()
  .normalizeEmail()
  .withMessage("Please provide a valid email");

// Address validator
const addressValidator = body("address")
  .isLength({ max: 400 })
  .withMessage("Address must not exceed 400 characters");

// Password validator
const passwordValidator = body("password")
  .isLength({ min: 8, max: 16 })
  .withMessage("Password must be between 8 and 16 characters")
  .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
  .withMessage(
    "Password must contain at least one uppercase letter and one special character"
  );

// Rating validator
const ratingValidator = body("rating")
  .isInt({ min: 1, max: 5 })
  .withMessage("Rating must be between 1 and 5");

// Role validator
const roleValidator = body("role")
  .isIn(["admin", "user", "store_owner"])
  .withMessage("Invalid role");

/* ----------------------------- Validation Chains ----------------------------- */

// Registration (Normal User signup)
const registerValidation = [
  userNameValidator,
  emailValidator,
  addressValidator,
  passwordValidator,
];

// Login
const loginValidation = [
  emailValidator,
  body("password").notEmpty().withMessage("Password is required"),
];

// Update password
const updatePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  passwordValidator,
];

// Admin: create user (Normal or Admin or Store Owner)
const createUserValidation = [
  userNameValidator,
  emailValidator,
  addressValidator,
  passwordValidator,
  roleValidator.optional(),
];

// Admin: create store
const createStoreValidation = [
  storeNameValidator,
  emailValidator,
  addressValidator,
  body("owner_id")
    .toInt()
    .isInt()
    .withMessage("Owner ID must be a valid integer"),
];

// Ratings
const ratingValidation = [
  ratingValidator,
  body("store_id")
    .toInt()
    .isInt()
    .withMessage("Store ID must be a valid integer"),
];

module.exports = {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  createUserValidation,
  createStoreValidation,
  ratingValidation,
};
