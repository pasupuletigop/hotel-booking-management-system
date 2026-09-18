const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL || "https://ollama.com/api/chat";

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "gpt-oss:20b-cloud";

const generateAnswer = async ({
  systemPrompt,
  context,
  question,
}) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  if (!OLLAMA_API_KEY) {
    throw new Error("OLLAMA_API_KEY is not configured.");
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
    `Sending request to Ollama Cloud model: ${OLLAMA_MODEL}`
  );

  const response = await fetch(OLLAMA_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OLLAMA_API_KEY}`,
    },

    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      `Ollama Cloud API error (${response.status}):`,
      errorText
    );

    throw new Error(
      `Ollama Cloud request failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  console.log("Ollama Cloud response received.");

  return data?.message?.content?.trim() || "";
};

module.exports = generateAnswer;