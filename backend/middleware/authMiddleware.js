const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.header("authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Handle "Bearer <token>" or raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ msg: "Authentication token missing" });
  }

  try {
    const secret = process.env.JWT_SECRET || "budget_buddy_super_secret_jwt_key_2026";
    const decoded = jwt.verify(token, secret);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ msg: "Token is not valid or has expired" });
  }
};
