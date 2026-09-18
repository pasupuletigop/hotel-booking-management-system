const express = require("express");

const {
  createRoom,
  getRooms,
  getActiveRooms,
  searchAvailableRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} = require("../controllers/roomController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC ROUTES
// =====================================================

router.get("/", getRooms);

router.get("/active", getActiveRooms);

// IMPORTANT:
// /available MUST come before /:id
router.get("/available", searchAvailableRooms);

router.get("/:id", getRoomById);

// =====================================================
// PROTECTED ROUTES
// =====================================================

// Admin + Receptionist
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createRoom
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "receptionist"),
  updateRoom
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "receptionist"),
  updateRoomStatus
);

// Admin only
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteRoom
);

module.exports = router;