require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// ========================================
// CORS
// ========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ========================================
// BODY PARSER
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ========================================
// COOKIES
// ========================================

app.use(cookieParser());

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hotel Booking API is running",
  });
});

// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/hotel", hotelRoutes);

app.use("/api/rooms", roomRoutes);

// ========================================
// ERROR HANDLER
// ========================================
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use(errorMiddleware);

module.exports = app;