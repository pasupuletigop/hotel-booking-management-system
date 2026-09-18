require("dotenv").config();

const connectDB = require("../../config/db");
const retrieveContext = require("./retrieveContext");

const testRetriever = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    const question =
      "When can a customer cancel a booking?";

    console.log("\n=================================");
    console.log("RAG RETRIEVER TEST");
    console.log("=================================");

    console.log("\nQuestion:");
    console.log(question);

    const results = await retrieveContext(question, 3);

    console.log("\n=================================");
    console.log("RETRIEVED CONTEXT");
    console.log("=================================\n");

    if (!results.length) {
      console.log("No relevant context found.");
      process.exit(0);
    }

    results.forEach((result, index) => {
      console.log(`RESULT ${index + 1}`);
      console.log("---------------------------------");
      console.log(`Chunk Index : ${result.chunkIndex}`);
      console.log(
        `Similarity  : ${result.score.toFixed(4)}`
      );
      console.log("\nText:");
      console.log(result.text);
      console.log("\n=================================\n");
    });

    process.exit(0);
  } catch (error) {
    console.error("\nRetriever test failed:");
    console.error(error);

    process.exit(1);
  }
};

testRetriever();