require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// In traditional server mode, initialize connection on boot
if (!process.env.VERCEL) {
  connectDB().catch((err) => console.error("Database connection initialization failed:", err.message));
}

// API Routes - Mounted with and without /api prefix for maximum Vercel/local flexibility
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/budgets", budgetRoutes);
app.use("/budgets", budgetRoutes);

// Health check
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", service: "Budget Buddy Backend", timestamp: new Date() });
});

app.get(["/api", "/"], (req, res) => {
  res.json({ msg: "Budget Buddy API is running!", status: "ok" });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ msg: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message);
  res.status(500).json({
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
