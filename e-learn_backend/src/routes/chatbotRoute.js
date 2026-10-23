import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { askChatbot, prepareChatbot } from "../controller/chatbotController.js";

const router = express.Router();
router.use(protect.protect, protect.restrictTo("user"));
router.post("/prepare", prepareChatbot);
router.post("/ask", askChatbot);

export default router;
