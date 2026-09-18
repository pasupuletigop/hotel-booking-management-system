const { Ollama } = require("ollama");

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
});

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "qwen2.5:3b";

const generateAnswer = async ({
  systemPrompt,
  context,
  question,
}) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  const prompt = `
KNOWLEDGE CONTEXT:

${context}

CUSTOMER QUESTION:

${question}

Answer the customer using ONLY the knowledge context.
Do not use outside knowledge.
Do not invent information.
`;

  console.log(
    `Sending request to local Ollama model: ${OLLAMA_MODEL}`
  );

  const response = await ollama.chat({
    model: OLLAMA_MODEL,

    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    stream: false,

    options: {
      temperature: 0.1,
    },
  });

  console.log("Local LLM response received.");

  return response?.message?.content?.trim() || "";
};

module.exports = generateAnswer;