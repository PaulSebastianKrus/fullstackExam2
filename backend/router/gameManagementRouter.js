import express from "express";
import {
  listGames,
  createGame,
  deleteGame,
} from "../controller/gameManagementController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/list", listGames);
router.post("/create", createGame);
router.delete("/delete/:id", deleteGame);

export default router;
