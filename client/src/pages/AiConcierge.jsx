import { useEffect, useRef, useState } from "react";

import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  ShieldCheck,
  BookOpen,
  CalendarDays,
  BedDouble,
  Clock3,
} from "lucide-react";

import { sendChatMessage } from "../services/aiService";

const INITIAL_MESSAGE = {
  id: 1,
  role: "assistant",
  text:
    "Welcome to Grand Palace. I’m your AI Concierge. I can help you understand hotel information, policies, bookings, and other services available in the knowledge base.",
};

const QUICK_QUESTIONS = [
  {
    icon: CalendarDays,
    label: "Cancellation policy",
    question: "When can I cancel my booking?",
  },
  {
    icon: BedDouble,
    label: "Room information",
    question: "What information is available about the rooms?",
  },
  {
    icon: Clock3,
    label: "Booking information",
    question: "What are the booking rules?",
  },
  {
    icon: BookOpen,
    label: "System information",
    question: "What roles are available in the hotel booking system?",
  },
];

const AiConcierge = () => {
  const [messages, setMessages] = useState([
    INITIAL_MESSAGE,
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const askQuestion = async (question) => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        text: cleanQuestion,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await sendChatMessage(
        cleanQuestion
      );

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            response?.message ||
            "I couldn't find that information in the available hotel information.",
          sources: response?.sources || [],
        },
      ]);
    } catch (error) {
      console.error("AI Concierge error:", error);

      let errorText =
        "I'm sorry, the AI Concierge is temporarily unavailable. Please try again.";

      if (error?.response?.status === 401) {
        errorText =
          "Please log in to use the AI Concierge.";
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: errorText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    askQuestion(message);
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

  const resetConversation = () => {
    if (loading) return;

    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: Date.now(),
      },
    ]);

    setMessage("");
  };

  return (
    <div className="ai-concierge-page">

      {/* HERO */}
      <section className="ai-concierge-hero">

        <div className="ai-hero-content">
          <div className="ai-hero-badge">
            <Sparkles size={15} />
            LOCAL AI CONCIERGE
          </div>

          <h1>
            Your personal
            <span> hotel concierge.</span>
          </h1>

          <p>
            Ask questions about Grand Palace and get
            answers grounded in the hotel's available
            information.
          </p>

          <div className="ai-hero-trust">
            <div>
              <ShieldCheck size={17} />
              Knowledge-grounded
            </div>

            <div>
              <Bot size={17} />
              Powered by local AI
            </div>
          </div>
        </div>

        <div className="ai-hero-decoration">
          <div className="ai-hero-circle">
            <Bot size={70} strokeWidth={1.2} />
          </div>

          <div className="ai-hero-orbit ai-orbit-one" />
          <div className="ai-hero-orbit ai-orbit-two" />
        </div>

      </section>

      {/* MAIN */}
      <section className="ai-concierge-workspace">

        {/* CHAT */}
        <div className="ai-chat-card">

          {/* CHAT HEADER */}
          <div className="ai-chat-header">

            <div className="ai-chat-header-left">
              <div className="ai-large-avatar">
                <Bot size={24} />
              </div>

              <div>
                <h2>AI Concierge</h2>

                <div className="ai-online">
                  <span />
                  Online · Local AI
                </div>
              </div>
            </div>

            <button
              type="button"
              className="ai-reset-button"
              onClick={resetConversation}
              disabled={loading}
              title="Start new conversation"
            >
              <RotateCcw size={17} />
              <span>New chat</span>
            </button>

          </div>

          {/* MESSAGES */}
          <div className="ai-chat-body">

            {messages.map((item) => (
              <div
                key={item.id}
                className={`ai-message-row ${
                  item.role === "user"
                    ? "ai-user-row"
                    : "ai-assistant-row"
                }`}
              >

                {item.role === "assistant" && (
                  <div className="ai-small-avatar">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`ai-message-content ${
                    item.role === "user"
                      ? "ai-user-message"
                      : "ai-assistant-message"
                  }`}
                >
                  <div className="ai-message-label">
                    {item.role === "user"
                      ? "You"
                      : "AI Concierge"}
                  </div>

                  <div className="ai-message-text">
                    {item.text}
                  </div>
                </div>

                {item.role === "user" && (
                  <div className="ai-small-avatar ai-user-avatar">
                    <User size={15} />
                  </div>
                )}

              </div>
            ))}

            {loading && (
              <div className="ai-message-row ai-assistant-row">

                <div className="ai-small-avatar">
                  <Bot size={15} />
                </div>

                <div className="ai-message-content ai-assistant-message">

                  <div className="ai-message-label">
                    AI Concierge
                  </div>

                  <div className="ai-typing">
                    <span />
                    <span />
                    <span />
                  </div>

                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT */}
          <div className="ai-chat-input-wrapper">

            <div className="ai-chat-input">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask your concierge anything..."
                rows={1}
                disabled={loading}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={
                  loading || !message.trim()
                }
                className="ai-send-button"
              >
                <Send size={18} />
              </button>

            </div>

            <div className="ai-input-hint">
              Press Enter to send · Shift + Enter for
              a new line
            </div>

          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="ai-info-panel">

          <div className="ai-info-card">

            <div className="ai-info-icon">
              <Sparkles size={21} />
            </div>

            <h3>
              How can I help?
            </h3>

            <p>
              Choose a question below or ask something
              in your own words.
            </p>

          </div>

          <div className="ai-quick-section">

            <div className="ai-section-label">
              QUICK QUESTIONS
            </div>

            <div className="ai-quick-list">

              {QUICK_QUESTIONS.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="ai-quick-card"
                      onClick={() =>
                        askQuestion(item.question)
                      }
                      disabled={loading}
                    >
                      <div className="ai-quick-icon">
                        <Icon size={18} />
                      </div>

                      <div>
                        <strong>
                          {item.label}
                        </strong>

                        <span>
                          {item.question}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* GROUNDING CARD */}
          <div className="ai-grounding-card">

            <div className="ai-grounding-icon">
              <ShieldCheck size={18} />
            </div>

            <div>
              <strong>
                Knowledge-grounded answers
              </strong>

              <p>
                Responses are generated using the
                available Grand Palace hotel
                knowledge base.
              </p>
            </div>

          </div>

        </aside>

      </section>

    </div>
  );
};

export default AiConcierge;