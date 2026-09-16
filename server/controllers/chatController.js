import ChatMessage from "../models/ChatMessage.js";
import Profile from "../models/Profile.js";
import { askCareerAssistant } from "../services/aiService.js";

export const getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(40).lean();
    res.json(messages.reverse());
  } catch { res.status(500).json({ message: "Unable to load chat history" }); }
};

export const sendChatMessage = async (req, res) => {
  try {
    const content = String(req.body?.message || "").trim();
    if (!content) return res.status(400).json({ message: "Enter a message to send." });
    if (content.length > 4000) return res.status(400).json({ message: "Please keep messages under 4,000 characters." });

    const userMessage = await ChatMessage.create({ userId: req.user.id, role: "user", content });
    const [profile, recent] = await Promise.all([
      Profile.findOne({ userId: req.user.id }).lean(),
      ChatMessage.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    const reply = await askCareerAssistant({ message: content, profile, history: recent.reverse() });
    const assistantMessage = await ChatMessage.create({ userId: req.user.id, role: "assistant", content: reply });
    res.status(201).json({ userMessage, assistantMessage });
  } catch (error) { res.status(500).json({ message: error.message || "Unable to send message" }); }
};

export const clearChatHistory = async (req, res) => {
  try { await ChatMessage.deleteMany({ userId: req.user.id }); res.status(204).end(); }
  catch { res.status(500).json({ message: "Unable to clear chat history" }); }
};
