import express from "express";
import emailController from "../controller/email_controller.js";
const router = express.Router();

router.post("/contact", emailController.receiveEmail);

export default router;  