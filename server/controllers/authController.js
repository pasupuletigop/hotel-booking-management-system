const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// =====================================================
// GOOGLE CLIENT
// =====================================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// =====================================================
// COOKIE OPTIONS
// =====================================================

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// =====================================================
// REGISTER
// PUBLIC REGISTRATION = CUSTOMER ONLY
// =====================================================

const register = async (req, res, next) => {
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
        message:
          "Name, email and password are required",
      });
    }

    // -------------------------------------------------
    // Validate password
    // -------------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters",
      });
    }

    // -------------------------------------------------
    // Normalize email
    // -------------------------------------------------

    const normalizedEmail =
      email.toLowerCase().trim();

    // -------------------------------------------------
    // Check existing user
    // -------------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    // -------------------------------------------------
    // Hash password
    // -------------------------------------------------

    const salt = await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // -------------------------------------------------
    // Create customer
    //
    // IMPORTANT:
    // Never accept role from public registration.
    // -------------------------------------------------

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
    });

    // -------------------------------------------------
    // Generate JWT
    // -------------------------------------------------

    const token = generateToken(user);

    // -------------------------------------------------
    // Store JWT in HTTP-only cookie
    // -------------------------------------------------

    res.cookie(
      "token",
      token,
      cookieOptions
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration successful",

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
// LOGIN
// =====================================================

const login = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // -------------------------------------------------
    // Normalize email
    // -------------------------------------------------

    const normalizedEmail =
      email.toLowerCase().trim();

    // -------------------------------------------------
    // Find user
    //
    // Explicitly select password because the model
    // may use select:false.
    // -------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // Compare password
    // -------------------------------------------------

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // Generate JWT
    // -------------------------------------------------

    const token = generateToken(user);

    // -------------------------------------------------
    // Store JWT in cookie
    // -------------------------------------------------

    res.cookie(
      "token",
      token,
      cookieOptions
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",

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
// GOOGLE LOGIN / REGISTER
// =====================================================

const googleLogin = async (
  req,
  res,
  next
) => {
  try {
    const {
      credential,
    } = req.body;

    // -------------------------------------------------
    // Validate Google credential
    // -------------------------------------------------

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required",
      });
    }

    // -------------------------------------------------
    // Verify Google ID token
    // -------------------------------------------------

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,

        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    // -------------------------------------------------
    // Get Google payload
    // -------------------------------------------------

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential",
      });
    }

    // -------------------------------------------------
    // Google information
    // -------------------------------------------------

    const {
      email,
      name,
      email_verified,
    } = payload;

    // -------------------------------------------------
    // Validate email
    // -------------------------------------------------

    if (
      !email ||
      !email_verified
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Google email could not be verified",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // -------------------------------------------------
    // Find existing account
    // -------------------------------------------------

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // -------------------------------------------------
    // Create customer if account doesn't exist
    // -------------------------------------------------

    if (!user) {

      // Generate random password because your
      // User model currently requires password.
      const randomPassword =
        crypto
          .randomBytes(32)
          .toString("hex");

      const salt =
        await bcrypt.genSalt(12);

      const hashedPassword =
        await bcrypt.hash(
          randomPassword,
          salt
        );

      user = await User.create({
        name:
          name?.trim() ||
          "Google User",

        email:
          normalizedEmail,

        password:
          hashedPassword,

        // Google public accounts are customers.
        role: "customer",
      });
    }

    // -------------------------------------------------
    // Generate your normal JWT
    // -------------------------------------------------

    const token =
      generateToken(user);

    // -------------------------------------------------
    // Store JWT in HTTP-only cookie
    // -------------------------------------------------

    res.cookie(
      "token",
      token,
      cookieOptions
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Google authentication successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(
      "Google authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Google authentication failed",
    });
  }
};

// =====================================================
// LOGOUT
// =====================================================

const logout = async (
  req,
  res,
  next
) => {
  try {

    res.clearCookie(
      "token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Logout successful",
    });

  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

const getMe = async (
  req,
  res,
  next
) => {
  try {

    const user =
      await User.findById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,

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
// EXPORT
// =====================================================

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  getMe,
};