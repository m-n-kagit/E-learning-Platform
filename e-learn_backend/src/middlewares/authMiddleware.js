import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized - no token provided");
    }

    if (!tokenSecret) {
      throw new Error("JWT secret is missing from environment variables");
    }

    const decoded = jwt.verify(token, tokenSecret);
    if (decoded.purpose && decoded.purpose !== "auth") {
      res.status(401);
      throw new Error("This token cannot be used for authenticated app access");
    }

    req.user = await User.findById(decoded.id).select("-password");
    req.auth = decoded;

    if (!req.user) {
      res.status(401);
      throw new Error("User belonging to this token no longer exists");
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401);
      return next(new Error("Token expired - please log in again"));
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401);
      return next(new Error("Invalid token - access denied"));
    }

    next(error);
  }
};

//RBAC - restrictTo middleware to restrict access based on user roles

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission to perform this action"));
    }
    next();
  };
};

export default { protect, restrictTo };
