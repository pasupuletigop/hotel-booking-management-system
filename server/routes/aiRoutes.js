const express = require("express");

const { chat } = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * AI Concierge
 *
 * Only authenticated users can use the chatbot.
 */
router.post("/chat", protect, chat);

module.exports = router;