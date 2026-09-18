const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel is required"],
    },

    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },

    roomType: {
      type: String,
      enum: [
        "single",
        "double",
        "twin",
        "suite",
        "deluxe",
      ],
      required: [true, "Room type is required"],
    },

    capacity: {
      type: Number,
      required: [true, "Room capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },

    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },

    amenities: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index(
  {
    hotel: 1,
    roomNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);