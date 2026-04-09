import mongoose from "mongoose";

const BLOCKED_TOKEN_TTL_SECONDS = 5 * 60;

const blockedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    // MongoDB TTL indexes only work on Date fields.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + BLOCKED_TOKEN_TTL_SECONDS * 1000),
      expires: 0,
      index: true,
    },
  },
  { timestamps: true }
);

const BlockedToken = mongoose.model("BlockedToken", blockedTokenSchema);
export default BlockedToken;
