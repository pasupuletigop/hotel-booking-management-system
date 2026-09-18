import { useState } from "react";

import {
  Bot,
  X,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { sendChatMessage } from "../../services/aiService";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text:
        "Welcome to Grand Palace. I'm your AI Concierge. How may I assist you?",
    },
  ]);

  const handleSend = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: cleanMessage,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await sendChatMessage(
        cleanMessage
      );

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text:
          response?.message ||
          "I couldn't find that information in the available hotel information.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("AI Concierge error:", error);

      let errorMessage =
        "I'm sorry, the AI Concierge is temporarily unavailable. Please try again.";

      if (error?.response?.status === 401) {
        errorMessage =
          "Please log in to use the AI Concierge.";
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className="ai-concierge-floating-button"
          onClick={() => setOpen(true)}
          aria-label="Open AI Concierge"
        >
          <Sparkles size={20} />
          <span>AI Concierge</span>
        </button>
      )}

      {open && (
        <div className="ai-concierge-panel">
          {/* Header */}
          <div className="ai-concierge-header">
            <div className="ai-concierge-title">
              <div className="ai-concierge-icon">
                <Bot size={20} />
              </div>

              <div>
                <strong>AI Concierge</strong>
                <span>Grand Palace Hotel</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-concierge-close"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status */}
          <div className="ai-concierge-status">
            <span />
            Online · Local AI
          </div>

          {/* Messages */}
          <div className="ai-concierge-messages">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`ai-chat-row ${
                  item.role === "user"
                    ? "ai-chat-row-user"
                    : "ai-chat-row-assistant"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="ai-message-avatar">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`ai-chat-message ${
                    item.role === "user"
                      ? "ai-chat-message-user"
                      : "ai-chat-message-assistant"
                  }`}
                >
                  {item.text}
                </div>

                {item.role === "user" && (
                  <div className="ai-message-avatar ai-message-avatar-user">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-chat-row ai-chat-row-assistant">
                <div className="ai-message-avatar">
                  <Bot size={15} />
                </div>

                <div className="ai-chat-message ai-chat-message-assistant ai-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="ai-concierge-input-area">
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask about hotel policies..."
              rows={1}
              disabled={loading}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                loading || !message.trim()
              }
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>

          {/* Footer */}
          <div className="ai-concierge-footer">
            Powered by local AI · Answers based on
            available hotel information
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;