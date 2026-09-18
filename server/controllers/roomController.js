const Room = require("../models/Room");
const Hotel = require("../models/Hotel");
const { getAvailableRooms } = require("../services/availabilityService");

// =====================================================
// CREATE ROOM
// =====================================================
const createRoom = async (req, res, next) => {
  try {
    const {
      hotel,
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      amenities,
      description,
      status,
    } = req.body;

    // Basic validation
    if (
      !hotel ||
      !roomNumber ||
      !roomType ||
      capacity === undefined ||
      pricePerNight === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "hotel, roomNumber, roomType, capacity and pricePerNight are required",
      });
    }

    // Check hotel exists
    const hotelExists = await Hotel.findById(hotel);

    if (!hotelExists) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Check duplicate room number in same hotel
    const existingRoom = await Room.findOne({
      hotel,
      roomNumber: roomNumber.trim(),
    });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "Room number already exists in this hotel",
      });
    }

    const room = await Room.create({
      hotel,
      roomNumber: roomNumber.trim(),
      roomType,
      capacity,
      pricePerNight,
      amenities: amenities || [],
      description: description || "",
      status: status || "active",
    });

    const populatedRoom = await Room.findById(room._id).populate(
      "hotel",
      "name address city state country phone email"
    );

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ALL ROOMS
// =====================================================
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find()
      .populate("hotel", "name address city state country phone email")
      .sort({ roomNumber: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ACTIVE ROOMS
// =====================================================
const getActiveRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      status: "active",
    })
      .populate("hotel", "name address city state country phone email")
      .sort({ roomNumber: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET AVAILABLE ROOMS
// =====================================================
// Example:
// GET /api/rooms/available?checkIn=2026-09-20&checkOut=2026-09-23&guests=2
const searchAvailableRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests } = req.query;

    // Check required parameters
    if (!checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: "checkIn, checkOut and guests are required",
      });
    }

    // Search available rooms
    const rooms = await getAvailableRooms({
      checkIn,
      checkOut,
      guests,
    });

    return res.status(200).json({
      success: true,
      search: {
        checkIn,
        checkOut,
        guests: Number(guests),
      },
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE ROOM
// =====================================================
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "hotel",
      "name address city state country phone email"
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE ROOM
// =====================================================
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // If hotel is being changed, verify the new hotel
    if (req.body.hotel && req.body.hotel.toString() !== room.hotel.toString()) {
      const hotelExists = await Hotel.findById(req.body.hotel);

      if (!hotelExists) {
        return res.status(404).json({
          success: false,
          message: "New hotel not found",
        });
      }
    }

    // Prevent duplicate room number inside same hotel
    if (req.body.roomNumber) {
      const hotelId = req.body.hotel || room.hotel;

      const duplicateRoom = await Room.findOne({
        hotel: hotelId,
        roomNumber: req.body.roomNumber.trim(),
        _id: { $ne: room._id },
      });

      if (duplicateRoom) {
        return res.status(409).json({
          success: false,
          message: "Room number already exists in this hotel",
        });
      }

      req.body.roomNumber = req.body.roomNumber.trim();
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "hotel",
      "name address city state country phone email"
    );

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE ROOM STATUS
// =====================================================
const updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "active",
      "inactive",
      "maintenance",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: active, inactive, maintenance",
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "hotel",
      "name address city state country phone email"
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room status changed to ${status}`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DELETE ROOM
// =====================================================
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================
module.exports = {
  createRoom,
  getRooms,
  getActiveRooms,
  searchAvailableRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
};