const mongoose = require("mongoose");

const roomBookingLockSchema =
  new mongoose.Schema(
    {
      room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
        unique: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "RoomBookingLock",
    roomBookingLockSchema
  );