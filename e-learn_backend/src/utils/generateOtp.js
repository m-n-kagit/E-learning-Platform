import crypto from "crypto";
import bcrypt from "bcrypt";

// Generates a 6-digit OTP and returns both
// plain (send to user) and hashed (store in DB)
const generateOTP = async () => {
  
  const otp = crypto.randomInt(100000, 999999).toString();
  
  
  const salt = await bcrypt.genSalt(10);//gensalt for hashing the OTP
  const hashedOTP = await bcrypt.hash(otp, salt);

  return { otp, hashedOTP };
};

export default generateOTP;
