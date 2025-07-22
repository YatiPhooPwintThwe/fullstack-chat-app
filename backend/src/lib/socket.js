import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

function getOnlineUsers() {
  return Object.keys(userSocketMap);
}

function removeOnlineUser(socketId) {
  for (const [userId, sId] of Object.entries(userSocketMap)) {
    if (sId === socketId) {
      delete userSocketMap[userId];
      break;
    }
  }
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
    console.log(`User ${userId} connected`);
  }

  io.emit("getOnlineUsers", getOnlineUsers());
  // 🔄 Real-time profile update broadcast
  socket.on("profileUpdated", ({ user }) => {
    if (!user || !user._id) return;
    // Send to all users (or you can filter if needed)
    io.emit("profileUpdated", user);
  });

  socket.on("disconnect", () => {
    removeOnlineUser(socket.id);
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

export { io, app, server };
