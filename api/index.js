const app = require('../backend/server');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    // Ensure database connection is ready before processing request
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      msg: "Database connection failed in serverless function",
      error: error.message,
    });
  }
};
