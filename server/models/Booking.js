const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },

    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
    },

    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
    },

    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least one guest is required"],
    },

    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    // Main booking status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "confirmed",
    },

    // =====================================================
    // CANCELLATION REQUEST WORKFLOW
    // =====================================================

    cancellationRequestStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "approved",
        "rejected",
      ],
      default: "none",
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Cancellation reason cannot exceed 500 characters",
      ],
    },

    cancellationRequestedAt: {
      type: Date,
    },

    cancellationReviewedAt: {
      type: Date,
    },

    cancellationReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

bookingSchema.index({
  customer: 1,
  createdAt: -1,
});

bookingSchema.index({
  room: 1,
  checkIn: 1,
  checkOut: 1,
  status: 1,
});

bookingSchema.index({
  cancellationRequestStatus: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);