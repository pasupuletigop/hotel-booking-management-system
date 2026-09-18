require("dotenv").config();

const connectDB = require("../../config/db");
const ragChat = require("./ragService");

const testRag = async () => {
  try {
    await connectDB();

    const questions = [
      "What roles are available in the hotel booking system?",
      "When can a customer cancel a booking?",
      "Is room 202 available tomorrow?",
    ];

    for (const question of questions) {
      console.log("\n\n=================================");
      console.log("QUESTION");
      console.log("=================================");
      console.log(question);

      const result = await ragChat(question);

      console.log("\nANSWER");
      console.log("---------------------------------");
      console.log(result.answer);

      console.log("\nSOURCES");
      console.log("---------------------------------");
      console.log(result.sources);
    }

    process.exit(0);
  } catch (error) {
    console.error("\nRAG test failed:");
    console.error(error);

    process.exit(1);
  }
};

testRag();