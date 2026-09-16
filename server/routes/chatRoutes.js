import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { clearChatHistory, getChatHistory, sendChatMessage } from "../controllers/chatController.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", getChatHistory);
router.post("/", sendChatMessage);
router.delete("/", clearChatHistory);
export default router;
