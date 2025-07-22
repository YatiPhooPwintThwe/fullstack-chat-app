import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchUsers } from "../controllers/user.controller.js";
import { getUserById } from "../controllers/user.controller.js";


const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/user/:id", protectRoute, getUserById);


export default router;
