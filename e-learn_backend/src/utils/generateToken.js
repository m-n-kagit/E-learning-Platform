import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "1h";

/**
 * Generates a signed JWT token.
 * Payload: user's _id (MongoDB ObjectId)
 * Signed with: JWT_SECRET from environment
 * Expires in: 7 days (configurable)
 */
const generateToken = (userId, options = {}) => {
  const {
    purpose = "auth",
    expiresIn = tokenExpiry,
    jwtid = randomUUID(), // Generate a unique JWT ID for each token
  } = options;

  if (!tokenSecret) {
    throw new Error("JWT secret is missing from environment variables");
  }

  return jwt.sign({ id: userId, purpose }, tokenSecret, { //signing the token with the user id and 
  // purpose of the token which is auth in this case
    expiresIn,
    jwtid,
  });
};

// const generateRefressToken = (userId,op)

export default generateToken;
