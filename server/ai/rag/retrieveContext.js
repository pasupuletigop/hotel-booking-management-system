const KnowledgeChunk = require("../../models/KnowledgeChunk");
const embedText = require("./embedText");

/**
 * Calculate cosine similarity between two vectors.
 */
const cosineSimilarity = (vectorA, vectorB) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] * vectorA[i];

    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
};

/**
 * Retrieve relevant knowledge from MongoDB.
 */
const retrieveContext = async (question, limit = 5) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  console.log("Generating local embedding for question...");

  // IMPORTANT:
  // This uses your LOCAL embedding model.
  // No OpenAI API is used.
  const questionEmbedding = await embedText(question.trim());

  console.log("Question embedding generated.");

  // Get PDF chunks stored in MongoDB.
  const chunks = await KnowledgeChunk.find({
    source: "hotel-knowledge.pdf",
  })
    .select("text embedding chunkIndex metadata")
    .lean();

  if (!chunks.length) {
    console.log("No knowledge chunks found in MongoDB.");
    return [];
  }

  console.log(`Searching ${chunks.length} knowledge chunks...`);

  // Calculate similarity between the question
  // and every stored PDF chunk.
  const rankedChunks = chunks
    .map((chunk) => {
      const score = cosineSimilarity(
        questionEmbedding,
        chunk.embedding
      );

      return {
        text: chunk.text,
        chunkIndex: chunk.chunkIndex,
        metadata: chunk.metadata,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log("\nTop matching chunks:");

  rankedChunks.forEach((chunk, index) => {
    console.log(
      `${index + 1}. Chunk ${chunk.chunkIndex} → score: ${chunk.score.toFixed(4)}`
    );
  });

  return rankedChunks;
};

module.exports = retrieveContext;