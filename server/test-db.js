require("dotenv").config();

const mongoose = require("mongoose");

console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

async function testConnection() {
  try {
    console.log("Connecting to MongoDB Atlas...");

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ CONNECTED TO MONGODB ATLAS");
    console.log("Host:", connection.connection.host);
    console.log("Database:", connection.connection.name);

    await mongoose.disconnect();

    console.log("Connection closed.");
    process.exit(0);
  } catch (error) {
    console.log("❌ MONGODB CONNECTION FAILED");
    console.log(error.message);
    process.exit(1);
  }
}

testConnection();