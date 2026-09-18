const {
  pipeline
} = require("@xenova/transformers");

let embedder = null;

const getEmbedder = async () => {
  if (!embedder) {
    console.log(
      "Loading local embedding model..."
    );

    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log(
      "Local embedding model loaded successfully."
    );
  }

  return embedder;
};

const embedText = async (text) => {
  if (!text || !text.trim()) {
    throw new Error(
      "Text is required for embedding."
    );
  }

  const model = await getEmbedder();

  const output = await model(
    text,
    {
      pooling: "mean",
      normalize: true,
    }
  );

  return Array.from(output.data);
};

module.exports = embedText;