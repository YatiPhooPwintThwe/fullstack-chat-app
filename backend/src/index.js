import express from "express";

import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server, io } from "./lib/socket.js"; // ✅ already contains `express()`
import path from "path";
dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// ✅ Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
// ✅ Attach socket.io instance to app so controllers can use it
app.set("io", io);


// ✅ Routes
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  })
}


// ✅ Start server only after DB connects
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
  });
