const express = require("express");

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelMyBooking,
  requestBookingCancellation,
  reviewCancellationRequest,
  updateBookingStatus,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// CUSTOMER BOOKING
// =====================================================

router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createBooking
);

router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyBookings
);

// =====================================================
// CUSTOMER CANCELLATION
// =====================================================

// Direct cancellation.
// Allowed up to 24 hours before check-in.
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("customer"),
  cancelMyBooking
);

// Late cancellation request.
// Used after the 24-hour deadline.
router.post(
  "/:id/cancellation-request",
  protect,
  authorizeRoles("customer"),
  requestBookingCancellation
);

// =====================================================
// STAFF BOOKING MANAGEMENT
// =====================================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "receptionist"
  ),
  getAllBookings
);

// =====================================================
// STAFF CANCELLATION REQUEST REVIEW
// =====================================================

router.patch(
  "/:id/cancellation-request/review",
  protect,
  authorizeRoles(
    "admin",
    "receptionist"
  ),
  reviewCancellationRequest
);

// =====================================================
// STAFF STATUS MANAGEMENT
// =====================================================

router.patch(
  "/:id/status",
  protect,
  authorizeRoles(
    "admin",
    "receptionist"
  ),
  updateBookingStatus
);

// =====================================================
// SINGLE BOOKING
// =====================================================

router.get(
  "/:id",
  protect,
  getBookingById
);

module.exports = router;