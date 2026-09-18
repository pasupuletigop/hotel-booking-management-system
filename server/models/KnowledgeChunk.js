const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    metadata: {
      page: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

knowledgeChunkSchema.index({
  source: 1,
  chunkIndex: 1,
});

module.exports = mongoose.model(
  "KnowledgeChunk",
  knowledgeChunkSchema
);