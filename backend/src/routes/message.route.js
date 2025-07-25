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
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// ✅ New routes following original style
router.put("/update/:id", protectRoute, updateMessage);
router.put("/react/:id", protectRoute, updateReaction);
router.delete("/delete/:id", protectRoute, deleteMessage);
router.delete("/chat/:userId", protectRoute, deleteChat);

export default router;
