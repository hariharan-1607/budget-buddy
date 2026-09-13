const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "budget_buddy_super_secret_jwt_key_2026";

// Helper to generate long-lived token (30 days, like real production websites)
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please enter all fields (name, email, password)" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists with this email" });
    }

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    return res.status(201).json({
      msg: "User registered successfully",
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ msg: "Server error during registration", error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide both email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    return res.json({
      msg: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Server error during login", error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile from token
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ msg: "Server error fetching user", error: error.message });
  }
});

module.exports = router;
