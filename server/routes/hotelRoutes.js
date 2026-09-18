const express = require("express");

const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================
// CREATE HOTEL
// Admin only
// =====================================
router.post(
  "/",
  protect,
  adminOnly,
  createHotel
);

// =====================================
// GET ALL HOTELS
// Authenticated users
// =====================================
router.get(
  "/",
  protect,
  getHotels
);

// =====================================
// GET HOTEL BY ID
// Authenticated users
// =====================================
router.get(
  "/:id",
  protect,
  getHotelById
);

// =====================================
// UPDATE HOTEL
// Admin only
// =====================================
router.put(
  "/:id",
  protect,
  adminOnly,
  updateHotel
);

// =====================================
// DELETE HOTEL
// Admin only
// =====================================
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteHotel
);

module.exports = router;