import { Server } from "socket.io";

let io;
const userSocketMap = {}; // { userId: socketId }

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL, // ✅ or your deployed frontend domain
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      socket.join(userId);
      console.log(`User ${userId} connected`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("profileUpdated", ({ user }) => {
      if (user?._id) {
        io.emit("profileUpdated", user);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sId] of Object.entries(userSocketMap)) {
        if (sId === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId];
