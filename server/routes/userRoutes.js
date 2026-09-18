const express = require("express");

const {
  createReceptionist,
  getUsers,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// ADMIN USER MANAGEMENT
// =====================================================

// Get all users
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getUsers
);

// Create receptionist
router.post(
  "/receptionist",
  protect,
  authorizeRoles("admin"),
  createReceptionist
);

module.exports = router;