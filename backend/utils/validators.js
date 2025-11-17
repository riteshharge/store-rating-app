const { body } = require("express-validator");

/* ------------------------ Common Field Validators ------------------------ */

/**
 * USER NAME VALIDATOR
 * Assignment Rule: Min 20 chars, Max 60 chars
 */
const userNameValidator = body("name")
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage("Name must be between 20 and 60 characters");

/**
 * STORE NAME VALIDATOR
 * Store names usually allow shorter length, so keep 3–60
 */
const storeNameValidator = body("name")
  .isLength({ min: 3, max: 60 })
  .withMessage("Store name must be between 3 and 60 characters");

/**
 * EMAIL VALIDATOR
 * Standard email format
 */
const emailValidator = body("email")
  .isEmail()
  .withMessage("Please provide a valid email");

/**
 * ADDRESS VALIDATOR
 * Assignment Rule: Max 400 chars
 */
const addressValidator = body("address")
  .trim()
  .isLength({ max: 400 })
  .withMessage("Address must not exceed 400 characters");

/**
 * PASSWORD VALIDATOR
 * Assignment Rule:
 *  - 8–16 characters
 *  - MUST include ≥1 uppercase letter
 *  - MUST include ≥1 special character
 */
const passwordValidator = body("password")
  .isLength({ min: 8, max: 16 })
  .withMessage("Password must be between 8 and 16 characters")
  .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
  .withMessage(
    "Password must include at least one uppercase letter and one special character"
  );

/**
 * RATING VALIDATOR
 */
const ratingValidator = body("rating")
  .isInt({ min: 1, max: 5 })
  .withMessage("Rating must be between 1 and 5");

/**
 * ROLE VALIDATOR
 */
const roleValidator = body("role")
  .optional()
  .isIn(["admin", "user", "store_owner"])
  .withMessage("Invalid role");

/* ----------------------------- Validation Chains ----------------------------- */

const registerValidation = [
  userNameValidator,
  emailValidator,
  addressValidator,
  passwordValidator,
];

const loginValidation = [
  emailValidator,
  body("password").notEmpty().withMessage("Password is required"),
];

const updatePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  passwordValidator,
];

const createUserValidation = [
  userNameValidator,
  emailValidator,
  addressValidator,
  passwordValidator,
  roleValidator,
];

const createStoreValidation = [
  storeNameValidator,
  emailValidator,
  addressValidator,
  body("owner_id")
    .toInt()
    .isInt()
    .withMessage("Owner ID must be a valid integer"),
];

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
