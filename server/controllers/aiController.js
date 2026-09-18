const ragChat = require("../ai/rag/ragService");

/**
 * POST /api/ai/chat
 *
 * Request:
 * {
 *   "message": "When can I cancel my booking?"
 * }
 */
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    console.log("\n=================================");
    console.log("AI CHAT API REQUEST");
    console.log("=================================");
    console.log("User:", req.user?._id || "Unknown");
    console.log("Message:", message.trim());

    // Send question to local RAG pipeline
    const result = await ragChat(message.trim());

    return res.status(200).json({
      success: true,
      message: result.answer,
      sources: result.sources || [],
    });
  } catch (error) {
    console.error("\nAI chat API error:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "The AI Concierge is temporarily unavailable. Please try again.",
    });
  }
};

module.exports = {
  chat,
};