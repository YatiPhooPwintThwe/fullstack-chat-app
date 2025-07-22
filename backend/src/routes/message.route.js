import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
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

// ✅ Static first
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/chat-requests", protectRoute, getChatRequests);
router.post("/accept-request/:senderId", protectRoute, acceptChatRequest);
router.post("/chat-request/:receiverId", protectRoute, sendChatRequest);
router.delete("/chat/:userId", protectRoute, deleteChat);

// ✅ Dynamic last
router.get("/send/:id", protectRoute, sendMessage);
router.get("/:id", protectRoute, getMessages);
router.put("/:id", protectRoute, updateMessage);
router.put("/:id/reaction", protectRoute, updateReaction);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
