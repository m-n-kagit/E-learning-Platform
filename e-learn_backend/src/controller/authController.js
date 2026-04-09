import bcrypt from "bcrypt";
import dns from "dns/promises";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import TempUser from "../models/Temp_user.js";
import OtpModel from "../models/Otp.js";
import User from "../models/User.js";
import generateOTP from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import Email from "../utils/send_email.js";
import pass_validator from "./pass_validator.js";
import uploadCloudinary from "../utils/cloudinery.js";
import BlockedToken from "../models/Blocked_tokens.models.js";
import virus_check from "../utils/virus_total.js";
import buildProfileInitial from "../utils/profileInitials.js";

const cookieMaxAge = Number(process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS) || 60 * 60 * 1000;
const resetPasswordCookieMaxAge = 10 * 60 * 1000; // 10 minutes for password reset token
const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const shouldRequireVirusScan = process.env.NODE_ENV === "production";

const validateDeliverableEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    return {
      isValid: false,
      message: "Please provide a valid email address.",
    };
  }

  const [, domain] = normalizedEmail.split("@");

  try {
    const mxRecords = await dns.resolveMx(domain);

    if (mxRecords.length > 0) {
      return { isValid: true, normalizedEmail };
    }
  } catch (error) {
    if (!["ENODATA", "ENOTFOUND", "ENODOMAIN", "ESERVFAIL", "ETIMEOUT"].includes(error?.code)) {
      throw error;
    }
  }

  try {
    const ipv4Records = await dns.resolve4(domain);

    if (ipv4Records.length > 0) {
      return { isValid: true, normalizedEmail };
    }
  } catch (error) {
    if (!["ENODATA", "ENOTFOUND", "ENODOMAIN", "ESERVFAIL", "ETIMEOUT"].includes(error?.code)) {
      throw error;
    }
  }

  return {
    isValid: false,
    message: "This email domain cannot receive messages. Please check the email and try again.",
  };
};

const getCookieOptions = (maxAge = cookieMaxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only send cookies over HTTPS in production
  sameSite: "lax", // Helps protect against CSRF attacks while allowing normal navigation
  maxAge,
});

const setTokenCookie = (res, userId, maxAge = cookieMaxAge, options = {}) => {
  const expiresIn = options.expiresIn || `${Math.floor(cookieMaxAge / 1000)}s`;
  res.cookie("token", generateToken(userId, { ...options, expiresIn }), getCookieOptions(maxAge));
};


const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const user = await User.create({ name, email, password });
    setTokenCookie(res, user._id, cookieMaxAge, {
      purpose: "auth",
      expiresIn: "24h",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerTempUser = async (req, res, next) => { //for course admin
  const uploadedFilePath = req.file?.path;
  try {
    const { name, email, password, role, adminPhoneNumber } = req.body;
    const normalizedRole = role === "course_admin" ? "course_admin" : "user";

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    const emailValidation = await validateDeliverableEmail(email);
    if (!emailValidation.isValid) {
      res.status(400);
      throw new Error(emailValidation.message);
    }

    const normalizedEmail = emailValidation.normalizedEmail;

    if (normalizedRole === "course_admin") {
      if (!adminPhoneNumber) {
        res.status(400);
        throw new Error("Please provide an admin contact number");
      }

      if (!req.file) {
        res.status(400);
        throw new Error("Please upload a PDF verification document for admin signup");
      }
    }

      const userExists = await User.findOne({ email: normalizedEmail , adminPhoneNumber: adminPhoneNumber });
      if (userExists) {
        res.status(409);
      throw new Error("An account with this email or admin phone number already exists");
    }

    await TempUser.deleteMany({ email: normalizedEmail });
      await OtpModel.deleteMany({ email: normalizedEmail });
  
      let adminDocument = null;
  
      if (normalizedRole === "course_admin" && uploadedFilePath) {
        let analysisId;
        try {
          analysisId = await virus_check.uploadFile(uploadedFilePath);
        } catch (error) {
          console.error("Error during virus scan upload:", error);
          if (shouldRequireVirusScan) {
            res.status(500);
            throw new Error("An error occurred while scanning the document for viruses. Please try again later.");
          }
        }

        if (!analysisId && shouldRequireVirusScan) {
          res.status(500);
          throw new Error("Unable to scan the uploaded document for viruses. Please try again later.");
        }

        if (analysisId) {
          let isClean;
          try {
            isClean = await virus_check.virus_check(analysisId);
          } catch (error) {
            console.error("Error during virus report check:", error);
            if (shouldRequireVirusScan) {
              res.status(500);
              throw new Error("An error occurred while checking the document for viruses. Please try again later.");
            }
          }

          if (isClean === false) {
            res.status(400);
            throw new Error("The uploaded document is potentially harmful. Please upload a clean file.");
          }
        }

        adminDocument = await uploadCloudinary(uploadedFilePath);
  
        if (!adminDocument?.secure_url) {//secure_url is the url of 
        // the uploaded file in cloudinary and 
        // if it is not present then it means that the upload failed
          res.status(500);
        throw new Error("Unable to upload admin verification document right now");
      }
    }

    const tempUser = await TempUser.create({
      name,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      adminPhoneNumber: normalizedRole === "course_admin" ? adminPhoneNumber : "",
      adminDocumentUrl: adminDocument?.secure_url || "",
      adminDocumentPublicId: adminDocument?.public_id || "",
    });

    res.status(201).json({
      success: true,
      message: "Temporary registration saved. Verify OTP within 10 minutes to activate the account.",
      data: {
        _id: tempUser._id,
        name: tempUser.name,
        email: tempUser.email,
        role: tempUser.role,
        adminPhoneNumber: tempUser.adminPhoneNumber,
        adminDocumentUrl: tempUser.adminDocumentUrl,
        expiresAt: tempUser.expiresAt
      },
      });
    } catch (error) {
      next(error);
    } finally {
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch((unlinkError) => {
          console.error("Failed to delete temporary upload:", unlinkError);
        });
      }
    }
  };

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");
    
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    setTokenCookie(res, user._id, cookieMaxAge, {
      purpose: "auth",
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => { //to get user 
  //details 
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (!user.initial) {
      user.initial = buildProfileInitial(user.name);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initial: user.initial,
        createdAt: user.createdAt
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Please provide email");
    }

    const emailValidation = await validateDeliverableEmail(email);
    if (!emailValidation.isValid) {
      res.status(400);
      throw new Error(emailValidation.message);
    }

    const normalizedEmail = emailValidation.normalizedEmail;

    const tempUser = await TempUser.findOne({ email: normalizedEmail });
    if (!tempUser) {
      res.status(400);
      throw new Error("Temporary registration not found or expired. Register again first.");
    }

    const { otp, hashedOTP } = await generateOTP();
    const emailResult = await Email.sendEmail({
      to: normalizedEmail,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 5 minutes only.</p>`,
    });

    if (!emailResult?.accepted?.includes(normalizedEmail)) {
      res.status(502);
      throw new Error("OTP email could not be delivered. Please try again.");
    }

    await OtpModel.create({ email: normalizedEmail, hashedOTP });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error("Please provide email and otp");
    }

    const record = await OtpModel.findOne({
      email,
      isVerify: false,
    }).sort({ createdAt: -1 });

    if (!record) {
      res.status(400);
      throw new Error("OTP expired or not found. Request a new one.");
    }

    if (!record.hashedOTP) {
      res.status(500);
      throw new Error("Stored OTP is invalid. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), record.hashedOTP);
    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid OTP");
    }

    record.isVerify = true;
    await record.save();

    const tempUser = await TempUser.findOne({ email }).select("+password");
    if (!tempUser) {
      res.status(400);
      throw new Error("Temporary registration expired or not found. Register again.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await TempUser.deleteMany({ email });
      await OtpModel.deleteMany({ email });
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
      adminPhoneNumber: tempUser.adminPhoneNumber,
      adminDocumentUrl: tempUser.adminDocumentUrl,
      adminDocumentPublicId: tempUser.adminDocumentPublicId,
    });
    user.$locals = { passwordAlreadyHashed: true };//here $locals is used 
    // to pass the information that the password is already hashed and 
    // it should not be hashed again in the pre save hook of the user model. 
    // This is necessary because we are creating a new user from the temp 
    // user which already has the password hashed and if we hash it again then 
    // it will not match with the original password and the user will not be 
    // able to login. By setting user.$locals.passwordAlreadyHashed to true, we can skip the hashing process in the pre save hook and save the user with the already hashed password.
    await user.save();

    await TempUser.deleteMany({ email });
    await OtpModel.deleteMany({ email });
    // setTokenCookie(res, user._id); not setting token cookie after registration 

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. Account activated.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const {token} = req.cookies;
    if (!token) {
      res.status(400);
      throw new Error("No active session found");
    }
    //Storing the token in the database if its expiry is above the 
    //logut time to prevent its reuse until it naturally expires.
    if (token) {
      await BlockedToken.create({ token });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};


const verifyOTP_forget_password = async (req, res, next) => {
  try {
    console.log("Verifying OTP for password reset with data:", req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error("Please provide email and otp");
    }

    const record = await OtpModel.findOne({
      email,
      isVerify: false,
    }).sort({ createdAt: -1 });

    if (!record) {
      res.status(400);
      throw new Error("OTP expired or not found. Request a new one.");
    }

    if (!record.hashedOTP) {
      res.status(500);
      throw new Error("Stored OTP is invalid. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), record.hashedOTP);
    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid OTP");
    }
    record.isVerify = true;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("User not found. Register first.");
    }

    record.isVerify = true;
    await record.save();
    setTokenCookie(res, user._id, resetPasswordCookieMaxAge, {
      purpose: "reset-password",
      expiresIn: "10m",
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

const Enter_new_password = async(req, res, next) => {
  try{
  const {email , new_password} = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Please provide email");
    }

    
    if (!new_password || !pass_validator(new_password)){
      res.status(400); // bad request 
      throw new Error("The provided new password is invalid or empty.");
    }

    const token = req.cookies?.token;
    if (!token) {
      res.status(401);
      throw new Error("Password reset session expired. Verify OTP again.");
    }

    if (!tokenSecret) {
      throw new Error("JWT secret is missing from environment variables");
    }

    const decoded = jwt.verify(token, tokenSecret);
    if (decoded.purpose !== "reset-password") {
      res.status(401);
      throw new Error("This token cannot be used for password reset.");
    }

    const user = await User.findOne({email})
    if (!user) {
      res.status(400);
      throw new Error("User not found. Register first.");
    }

    if (String(user._id) !== String(decoded.id)) {
      res.status(403);
      throw new Error("You are not authorized to reset this password.");
    }

    user.password = new_password;
    await user.save();
    await OtpModel.deleteMany({ email });
    res.clearCookie("token", getCookieOptions(0));
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  }

  catch (error) {
    next(error); // next is used to pass
    //  the error to the error handling middleware, 
    // which will send a response to the client.
    // This way we can handle all errors in one place 
    // and avoid sending multiple responses from different places in the code.
  }

}

const forget_pass = async(req, res,next) => {
    try{
      const {email} = req.body
       if (!email) {
        res.status(400);
        throw new Error("Please provide email");
      }
      const emailValidation = await validateDeliverableEmail(email);
      if (!emailValidation.isValid) {
        res.status(400);
        throw new Error(emailValidation.message);
      }
      const normalizedEmail = emailValidation.normalizedEmail;
      const record = await User.findOne({ email: normalizedEmail });
      if(!record){
        res.status(400);
        throw new Error("User with this email does not exist");
      }
      const { otp, hashedOTP } = await generateOTP();
      const emailResult = await Email.sendEmail({
        to: normalizedEmail,
        subject: "Your Password Reset OTP",
        html: `<h2>Your OTP for password reset is: <strong>${otp}</strong></h2><p>Valid for 5 minutes only.</p>`,
      });

      if (!emailResult?.accepted?.includes(normalizedEmail)) {
        res.status(502);
        throw new Error("Password reset OTP email could not be delivered. Please try again.");
      }

      await OtpModel.create({ email: normalizedEmail, hashedOTP });

      res.status(200).json({
        success: true,
        message: "OTP sent to your email for password reset",
      });
    }
    catch (error) {
      console.error("Error in forget_pass:", error);
      next(error);
    }
}


export default {
  registerUser,
  registerTempUser,
  loginUser,
  getMe,
  sendOTP,
  verifyOTP,
  logoutUser,
  forget_pass,
  verifyOTP_forget_password,
  Enter_new_password
};
