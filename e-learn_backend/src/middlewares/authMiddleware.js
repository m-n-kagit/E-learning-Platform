import  jwt from "jsonwebtoken";
import User from ("../models/User");

// ─── PROTECT MIDDLEWARE ───────────────────────────────────────────────────────
// Verifies the JWT in the Authorization header.
// If valid → attaches the decoded user to req.user and calls next().
// If invalid/missing → throws 401.
const protect = async (req, res, next) => {
  try {
    let token;

    // JWT is expected as: "Authorization: Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ") //Bearer token is a common convention
      //  for sending JWTs in the Authorization header. 
      // It indicates that the client is sending a token that should be used for authentication.
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized — no token provided");
    }

    // Verify the token — throws JsonWebTokenError or TokenExpiredError if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the real user from DB (to ensure the account still exists)
    // select("-password") is redundant here since model has select:false,
    // but it's explicit and clear — good engineering practice.
    req.user = await User.findById(decoded.id).select("-password"); //excluded password

    if (!req.user) {
      res.status(401);
      throw new Error("User belonging to this token no longer exists");
    }

    next();
  } catch (error) {
    // Handle specific JWT errors with cleaner messages
    if (error.name === "JsonWebTokenError") {
      res.status(401);
      return next(new Error("Invalid token — access denied"));
    }
    if (error.name === "TokenExpiredError") {
      res.status(401);
      return next(new Error("Token expired — please log in again"));
    }
    next(error);
  }
};

// ─── ROLE-BASED ACCESS CONTROL ────────────────────────────────────────────────
// Usage: router.get("/admin", protect, restrictTo("admin"), handler)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error("You do not have permission to perform this action")
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
