import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  hashedOTP: {
    type: String,
    required: true,
  },
  isVerify: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // MongoDB AUTO-DELETES this document after 300 seconds (5 min)
  },
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;