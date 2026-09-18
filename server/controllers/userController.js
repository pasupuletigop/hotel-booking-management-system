const bcrypt = require("bcryptjs");

const User = require("../models/User");

// =====================================================
// CREATE RECEPTIONIST
// ADMIN ONLY
// =====================================================

const createReceptionist = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // -------------------------------------------------
    // Validate name
    // -------------------------------------------------

    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    // -------------------------------------------------
    // Validate password
    // -------------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    // -------------------------------------------------
    // Normalize email
    // -------------------------------------------------

    const normalizedEmail = email.toLowerCase().trim();

    // -------------------------------------------------
    // Check existing user
    // -------------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // -------------------------------------------------
    // Hash password
    // -------------------------------------------------

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // -------------------------------------------------
    // Create receptionist
    //
    // IMPORTANT:
    // Role is controlled by the server.
    // The client cannot create an admin.
    // -------------------------------------------------

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "receptionist",
    });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Receptionist account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET USERS
// ADMIN ONLY
// =====================================================

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReceptionist,
  getUsers,
};