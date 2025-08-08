import express from "express";
import {
  startGame,
  quitGame,
  completeCustomGame,
} from "../controller/gameSessionController.js";
import { submitAnswer, useLifeline } from "../controller/gamePlayController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/answer", submitAnswer);
router.post("/lifeline", useLifeline);

router.post("/start", startGame);
router.post("/quit", quitGame);
router.post("/custom-game/:gameId/complete", completeCustomGame);

export default router;
