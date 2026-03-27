import  jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

const tokenSecret =  process.env.ACCESS_TOKEN_SECRET;

// ─── PROTECT MIDDLEWARE ───────────────────────────────────────────────────────
// Verifies the JWT in the Authorization header.
// If valid -> attaches the decoded user to req.user and calls next().
// If invalid/missing -> throws 401.
const protect = async (req, res, next) => { //next is used to pass the control to the next middleware in the stack.
  try {
    let token = req.cookies?.token;

    // Fall back to the Authorization header for non-browser clients.
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ") //Bearer token is a common convention
      //  for sending JWTs in the Authorization header. 
      // It indicates that the client is sending a token that should be used for authentication.
    ) {
      token = req.headers.authorization.split(" ")[1];//split function here is used
      //  to split the string into an array based on the space character.
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized — no token provided");
    }

    // Verify the token — throws JsonWebTokenError or TokenExpiredError if invalid
    if (!tokenSecret) {
      throw new Error("JWT secret is missing from environment variables");
    }

    const decoded = jwt.verify(token, tokenSecret);

    if (decoded.purpose && decoded.purpose !== "auth") {
      res.status(401);
      throw new Error("This token cannot be used for authenticated app access");
    }

    // Fetch the real user from DB (to ensure the account still exists)
    // select("-password") is redundant here since model has select:false,
    // but it's explicit and clear — good engineering practice.
    req.user = await User.findById(decoded.id).select("-password"); //excluded password
    req.auth = decoded;

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

export default { protect, restrictTo };
