const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    const allowedRoles = ["user", "store_owner"];
    const userRole = allowedRoles.includes(role) ? role : "user";

    const exists = await User.findByEmail(email);
    if (exists) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const userId = await User.create({
      name,
      email,
      password,
      address,
      role: userRole,
    });

    const token = generateToken(userId);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name,
        email,
        address,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await User.verifyPassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET ME
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      currentPassword,
      password: newPassword,
      confirmPassword,
    } = req.body;

    // If confirmPassword is provided, ensure it matches the new password
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New password and confirmation do not match",
      });
    }

    const user = await User.findByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const match = await User.verifyPassword(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await User.updatePassword(req.user.id, newPassword);

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
