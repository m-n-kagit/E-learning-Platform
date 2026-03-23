import express from "express";
const router = express.Router();
// const { registerUser, loginUser, getMe } = require("../controllers/authController");
import authcontroller from "../controller/authController.js"
import protect from "../middlewares/authMiddleware.js";


// Public routes
router.post("/register", authcontroller.registerUser);
router.post("/login", authcontroller.loginUser); // sending file in json format so that 
// we can easily access it in frontend and also for security 
// purpose we are not sending the password in response

// Protected route — requires valid JWT
router.get("/me", protect.protect, authcontroller.getMe);

export default router;
