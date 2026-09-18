const Hotel = require("../models/Hotel");

// =====================================
// CREATE HOTEL
// =====================================
const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      phone,
      email,
      amenities,
      status,
    } = req.body;

    if (
      !name ||
      !description ||
      !address ||
      !city ||
      !state ||
      !country ||
      !phone ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "All required hotel fields must be provided",
      });
    }

    const existingHotel = await Hotel.findOne({
      email: email.toLowerCase(),
    });

    if (existingHotel) {
      return res.status(409).json({
        success: false,
        message: "Hotel with this email already exists",
      });
    }

    const hotel = await Hotel.create({
      name,
      description,
      address,
      city,
      state,
      country,
      phone,
      email: email.toLowerCase(),
      amenities: amenities || [],
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      hotel: {
        _id: hotel._id,
        name: hotel.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL HOTELS
// =====================================
const getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find();

    return res.status(200).json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET HOTEL BY ID
// =====================================
const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE HOTEL
// =====================================
const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE HOTEL
// =====================================
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT
// =====================================
module.exports = {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
};