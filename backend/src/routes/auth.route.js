import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  login,
  logout,
  signup,
  updateProfile,
  checkAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.put("/change-password", protectRoute, changePassword);

router.get("/check", protectRoute, checkAuth);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
