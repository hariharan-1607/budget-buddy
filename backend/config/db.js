const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse existing connection (crucial for Vercel serverless)
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/budgetbuddy";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // In serverless, throw so the API handler can return a 500 JSON rather than hanging
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw error;
    }
    return null;
  }
};

module.exports = connectDB;
