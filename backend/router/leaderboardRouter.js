import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getLeaderboard,
  getUserStats,
  getUserGameHistory,
} from "../controller/leaderboardController.js";

const router = express.Router();

router.get("/leaderboard", getLeaderboard);

router.get("/me", authenticateToken, getUserStats);
router.get("/history", authenticateToken, getUserGameHistory);

export default router;
