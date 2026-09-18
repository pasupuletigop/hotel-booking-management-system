const express = require("express");

const {
  register,
  login,
  googleLogin,
  logout,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC AUTHENTICATION ROUTES
// =====================================================

// Register new customer
router.post(
  "/register",
  register
);

// Normal email/password login
router.post(
  "/login",
  login
);

// Google login / registration
router.post(
  "/google",
  googleLogin
);

// =====================================================
// PROTECTED AUTHENTICATION ROUTES
// =====================================================

// Logout
router.post(
  "/logout",
  protect,
  logout
);

// Get currently authenticated user
router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;