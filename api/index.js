const app = require('../backend/server');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  console.log(`[Vercel Serverless] Incoming ${req.method} ${req.url}`);
  try {
    // Ensure database connection is ready before processing request
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      msg: "Database connection failed in serverless function. Please check MONGO_URI in Vercel Environment Variables.",
      error: error.message,
    });
  }
};
