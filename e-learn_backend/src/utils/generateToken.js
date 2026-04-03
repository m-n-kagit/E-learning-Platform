import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

/**
 * Generates a signed JWT token.
 * Payload: user's _id (MongoDB ObjectId)
 * Signed with: JWT_SECRET from environment
 * Expires in: 7 days (configurable)
 */
const generateToken = (userId, options = {}) => {
  const {
    purpose = "auth",
    secret = purpose === "refresh" ? refreshTokenSecret : accessTokenSecret,
    expiresIn = purpose === "refresh" ? refreshTokenExpiry : accessTokenExpiry,
  } = options;

  if (!secret) {
    throw new Error("JWT secret is missing from environment variables");
  }

  return jwt.sign({ id: userId, purpose }, secret, { //signing the token with the user id and 
  // purpose of the token which is auth in this case
    expiresIn,
  });
};

// const generateRefressToken = (userId,op)

export default generateToken;
