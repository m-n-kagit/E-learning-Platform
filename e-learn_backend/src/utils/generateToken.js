import jwt from "jsonwebtoken";

const tokenSecret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "7d";

/**
 * Generates a signed JWT token.
 * Payload: user's _id (MongoDB ObjectId)
 * Signed with: JWT_SECRET from environment
 * Expires in: 7 days (configurable)
 */
const generateToken = (userId) => {
  if (!tokenSecret) {
    throw new Error("JWT secret is missing from environment variables");
  }

  return jwt.sign({ id: userId }, tokenSecret, {
    expiresIn: tokenExpiry,
  });
};

export default generateToken;
