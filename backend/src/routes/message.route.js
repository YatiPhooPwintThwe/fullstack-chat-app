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

// ✅ Static routes must go before dynamic ones
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/chat-requests", protectRoute, getChatRequests);
router.post("/accept-request/:senderId", protectRoute, acceptChatRequest);
router.post("/chat-request/:receiverId", protectRoute, sendChatRequest);
router.delete("/chat/:userId", protectRoute, deleteChat);

// ✅ These dynamic ones come AFTER
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/:id", protectRoute, updateMessage);
router.put("/:id/reaction", protectRoute, updateReaction);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
