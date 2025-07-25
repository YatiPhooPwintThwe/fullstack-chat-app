import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  updateMessage,
  updateReaction,
  deleteMessage,
  deleteChat,
  sendChatRequest,
  getChatRequests,
  acceptChatRequest,
} from "../controllers/message.controller.js";

const router = express.Router();

// 🟢 Chat sidebar and messages
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/update/:id", protectRoute, updateMessage);
router.put("/react/:id", protectRoute, updateReaction);
router.delete("/delete/:id", protectRoute, deleteMessage);
router.delete("/chat/:userId", protectRoute, deleteChat);

// 🟢 Chat request routes (formatted like others)
router.post("/chat-request/:receiverId", protectRoute, sendChatRequest);
router.get("/chat-requests", protectRoute, getChatRequests);
router.post("/accept-request/:senderId", protectRoute, acceptChatRequest);

export default router;
