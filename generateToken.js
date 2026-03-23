const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token.
 * Payload: user's _id (MongoDB ObjectId)
 * Signed with: JWT_SECRET from environment
 * Expires in: 7 days (configurable)
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
