import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
const accessTokenCookieMaxAge = Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS) || 15 * 60 * 1000;
const refreshTokenCookieMaxAge = Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge,
});

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

    if (!accessTokenSecret) {
      throw new Error("JWT secret is missing from environment variables");
    }

    const decoded = jwt.verify(token, accessTokenSecret);
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
      try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken || !refreshTokenSecret) {
          res.status(401);
          return next(new Error("Token expired - please log in again"));
        }

        const decodedRefresh = jwt.verify(refreshToken, refreshTokenSecret);
        if (decodedRefresh.purpose !== "refresh") {
          res.status(401);
          return next(new Error("Invalid refresh token - please log in again"));
        }

        const user = await User.findById(decodedRefresh.id).select("-password +refreshToken");
        if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
          res.status(401);
          return next(new Error("Refresh token mismatch - please log in again"));
        }

        const newAccessToken = generateToken(user._id, { purpose: "auth" });
        const newRefreshToken = generateToken(user._id, { purpose: "refresh" });

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("token", newAccessToken, getCookieOptions(accessTokenCookieMaxAge));
        res.cookie("refreshToken", newRefreshToken, getCookieOptions(refreshTokenCookieMaxAge));

        req.user = await User.findById(user._id).select("-password");
        req.auth = { id: String(user._id), purpose: "auth", refreshed: true };
        return next();
      } catch (refreshError) {
        res.status(401);
        return next(new Error("Token expired - please log in again"));
      }
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401);
      return next(new Error("Invalid token - access denied"));
    }

    next(error);
  }
};

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
