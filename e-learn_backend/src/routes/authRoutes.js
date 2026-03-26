import express from "express";
const router = express.Router();
// const { registerUser, loginUser, getMe } = require("../controllers/authController");
import authcontroller from "../controller/authController.js"
import protect from "../middlewares/authMiddleware.js";
import rateLimiter from "../utils/rate-limiter.js";

// Public routes
// router.post("/register", authcontroller.registerUser);
router.post("/register-temp", authcontroller.registerTempUser);
router.post("/send-otp", authcontroller.sendOTP);
router.post("/verify-otp",rateLimiter.login_limiter, authcontroller.verifyOTP);
router.post("/login",rateLimiter.login_limiter, authcontroller.loginUser); // sending file in json format so that 
// we can easily access it in frontend and also for security 
// purpose we are not sending the password in response

router.post("/logout", authcontroller.logoutUser);
router.post("/forget-password", authcontroller.forget_pass);
router.post("/verify-otp-forget-password",rateLimiter.login_limiter, authcontroller.verifyOTP_forget_password);
router.post("/enter-new-password", authcontroller.Enter_new_password);

router.get("/test", (req, res) => {
  res.send("Test route is working");
});

// Protected route — requires valid JWT
router.get("/me", protect.protect, authcontroller.getMe);
//this route is used to get the details of the logged in user and it is protected by the protect middleware which checks for the valid JWT token in the request header and if the token is valid then it allows the user to access the route otherwise it returns an error response

export default router;
