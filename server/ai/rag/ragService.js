const retrieveContext = require("./retrieveContext");

const generateAnswer = require("../ollamaClient");

const HOTEL_ASSISTANT_SYSTEM_PROMPT =
  require("../prompts/hotelAssistantPrompt");

/**
 * Main RAG chat service.
 */
const ragChat = async (question) => {
  if (
    !question ||
    typeof question !== "string" ||
    !question.trim()
  ) {
    throw new Error("A valid question is required.");
  }

  const cleanQuestion = question.trim();

  console.log("\n=================================");
  console.log("RAG CHAT");
  console.log("=================================");
  console.log("Question:", cleanQuestion);

  // STEP 1:
  // Retrieve relevant chunks using LOCAL embeddings.
  const retrievedChunks = await retrieveContext(
    cleanQuestion,
    5
  );

  // No knowledge found.
  if (!retrievedChunks.length) {
    return {
      answer:
        "I couldn't find that information in the available hotel information.",
      sources: [],
    };
  }

  // Minimum similarity threshold.
  const bestScore = retrievedChunks[0].score;

  console.log(
    `Best retrieval score: ${bestScore.toFixed(4)}`
  );

  // If the question is not sufficiently related
  // to the knowledge base, don't ask the LLM to guess.
  if (bestScore < 0.25) {
    return {
      answer:
        "I couldn't find that information in the available hotel information.",
      sources: [],
    };
  }

  // STEP 2:
  // Build context from retrieved chunks.
  const context = retrievedChunks
    .map(
      (chunk, index) =>
        `[Context ${index + 1}]\n${chunk.text}`
    )
    .join("\n\n");

  // STEP 3:
  // Send retrieved context to LOCAL LLM.
  const answer = await generateAnswer({
    systemPrompt: HOTEL_ASSISTANT_SYSTEM_PROMPT,
    context,
    question: cleanQuestion,
  });

  // STEP 4:
  // Safety fallback.
  if (!answer) {
    return {
      answer:
        "I couldn't generate an answer from the available hotel information.",
      sources: [],
    };
  }

  return {
    answer,

    sources: retrievedChunks.map((chunk) => ({
      chunkIndex: chunk.chunkIndex,
      score: Number(chunk.score.toFixed(4)),
    })),
  };
};

module.exports = ragChat;