require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const KnowledgeChunk = require("../../models/KnowledgeChunk");
const connectDB = require("../../config/db");

const chunkText = require("./chunkText");
const embedText = require("./embedText");

const PDF_PATH = path.join(
  __dirname,
  "../knowledge/hotel-knowledge.pdf"
);

const SOURCE_NAME = "hotel-knowledge.pdf";

const ingestPdf = async () => {
  try {
    console.log("Starting PDF ingestion...");

    // Check environment variable
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined. Check server/.env"
      );
    }

    console.log("MongoDB URI loaded successfully.");

    // Check PDF
    if (!fs.existsSync(PDF_PATH)) {
      throw new Error(
        `PDF not found at: ${PDF_PATH}`
      );
    }

    console.log(`PDF found: ${PDF_PATH}`);

    // Connect MongoDB
    await connectDB();

    // Read PDF
    const pdfBuffer = fs.readFileSync(PDF_PATH);

    console.log("Reading PDF...");

    // Parse PDF
    const pdfData = await pdfParse(pdfBuffer);

    const text = pdfData.text;

    if (!text || !text.trim()) {
      throw new Error(
        "No readable text was found in the PDF."
      );
    }

    console.log(
      `Extracted ${text.length} characters.`
    );

    // Create chunks
    const chunks = chunkText(text);

    console.log(
      `Created ${chunks.length} chunks.`
    );

    // Remove old chunks
    console.log("Removing old knowledge chunks...");

    await KnowledgeChunk.deleteMany({
      source: SOURCE_NAME,
    });

    // Generate embeddings and save
    for (
      let index = 0;
      index < chunks.length;
      index++
    ) {
      const chunk = chunks[index];

      console.log(
        `Embedding chunk ${index + 1}/${chunks.length}...`
      );

      const embedding = await embedText(chunk);

      await KnowledgeChunk.create({
        source: SOURCE_NAME,
        chunkIndex: index,
        text: chunk,
        embedding,
      });
    }

    console.log(
      "PDF ingestion completed successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "PDF ingestion failed:",
      error
    );

    process.exit(1);
  }
};

ingestPdf();