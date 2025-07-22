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

// ✅ Dynamic last (no conflict)
router.get("/messages-with/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
// NEW (✅ avoid conflict with static paths)
router.put("/message/:id", protectRoute, updateMessage);
router.put("/message/:id/reaction", protectRoute, updateReaction);
router.delete("/message/:id", protectRoute, deleteMessage);


export default router;
