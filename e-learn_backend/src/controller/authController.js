import bcrypt from "bcrypt";
import TempUser from "../models/Temp_user.js";
import OtpModel from "../models/Otp.js";
import User from "../models/User.js";
import generateOTP from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/send_email.js";
import pass_validator from "./pass_validator.js";

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

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerTempUser = async (req, res, next) => {
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

    await TempUser.deleteMany({ email });
    await OtpModel.deleteMany({ email });

    const tempUser = await TempUser.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Temporary registration saved. Verify OTP within 10 minutes to activate the account.",
      data: {
        _id: tempUser._id,
        name: tempUser.name,
        email: tempUser.email,
        role: tempUser.role,
        expiresAt: tempUser.expiresAt,
      },
    });
  } catch (error) {
    next(error);
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

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
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

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
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

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      res.status(400);
      throw new Error("Temporary registration not found or expired. Register again first.");
    }

    // await OtpModel.deleteMany({ email });

    const { otp, hashedOTP } = await generateOTP();
    await OtpModel.create({ email, hashedOTP });

    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 5 minutes only.</p>`,
    });

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

    const record = await OtpModel.findOne({ email }); // findOne returns null if not found, while find returns an empty array
    if (!record) {
      res.status(400);
      throw new Error("OTP expired or not found. Request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOTP);
    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid OTP");
    }

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
    });
    user.$locals = { passwordAlreadyHashed: true };
    await user.save();

    await TempUser.deleteMany({ email });
    await OtpModel.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. Account activated.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
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

    const record = await OtpModel.findOne({ email }); // findOne returns null if not found, while find returns an empty array
    if (!record) {
      res.status(400);
      throw new Error("OTP expired or not found. Request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOTP);
    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid OTP");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("User not found. Register first.");
    }

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

    
    if (!new_password && !pass_validator(new_password)){
      res.status(400); // bad request 
      throw new Error("The provided new password is invalid or empty.");
    }

    const user = await User.findOne({email})
    if (!user) {
      res.status(400);
      throw new Error("User not found. Register first.");
    }
    user.password = new_password;
    await user.save();
    await OtpModel.deleteMany({ email });
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
      const record = await User.findOne({ email });
      if(!record){
        res.status(400);
        throw new Error("User with this email does not exist");
      }
      const { otp, hashedOTP } = await generateOTP();
      await OtpModel.create({ email, hashedOTP });
      await sendEmail({
        to: email,
        subject: "Your Password Reset OTP",
        html: `<h2>Your OTP for password reset is: <strong>${otp}</strong></h2><p>Valid for 5 minutes only.</p>`,
      });
      res.status(200).json({
        success: true,
        message: "OTP sent to your email for password reset",
      });
    }
    catch (error) {
      console.error("Error in forget_pass:", error);
      res.status(500).json({ // 500 means internal server error, which is appropriate for unexpected errors
        success: false,
        message: "Internal server error",
      });
    }
}


export default {
  registerUser,
  registerTempUser,
  loginUser,
  getMe,
  sendOTP,
  verifyOTP,
  forget_pass,
  verifyOTP_forget_password,
  Enter_new_password
};
