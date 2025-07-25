import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import express from "express";
import http from "http";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { initSocket, io } from "./lib/socket.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const server = http.createServer(app);

// ✅ Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend domain in production
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.set("io", io);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend","dist", "index.html"));
  });
}

// ✅ Start server after DB connection
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      initSocket(server); // Setup WebSocket
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
  });
