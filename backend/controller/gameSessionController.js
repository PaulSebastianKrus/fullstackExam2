import Game from "../models/gameModel.js";
import GameSession from "../models/gameSessionModel.js";
import User from "../models/userModel.js";
import mongoose from "../utils/db.js";
import Question from "../models/questionsModel.js";
import { updateLeaderboard } from "./leaderboardController.js";
import {
  MONEY_VALUES,
  calculateMoneyAtStake,
  calculateSecuredMoney,
} from "../utils/gameConstants.js";

const endExistingGame = async (userId) => {
  const existingGame = await GameSession.findOne({
    userId: userId,
    status: "active",
  });

  if (existingGame) {
    existingGame.status = "abandoned";
    existingGame.endTime = new Date();
    await existingGame.save();
    return true;
  }
  return false;
};

const findDefaultGame = async () => {
  const defaultGame = await Game.findOne({ isDefault: true });
  if (!defaultGame) {
    return null;
  }
  return defaultGame;
};

const findGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (game) {
    game.playCount += 1;
    await game.save();
  }
  return game;
};

const findQuestionForLevel = async (game, level) => {
  let question = null;

  if (game.questions && game.questions.length > 0) {
    const levelQuestions = game.questions.filter((q) => q.difficulty === level);

    if (levelQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * levelQuestions.length);
      question = levelQuestions[randomIndex];
    }
  } else if (game.questionIds && game.questionIds.length > 0) {
    const questions = await Question.find({
      _id: { $in: game.questionIds },
      difficulty: level,
    });

    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      question = questions[randomIndex];
    }
  }

  return question;
};

const createGameSession = async (userId, gameId, questionId) => {
  const gameSession = new GameSession({
    userId,
    gameId:
      typeof gameId === "string" ? new mongoose.Types.ObjectId(gameId) : gameId,
    currentLevel: 1,
    currentQuestion: questionId,
  });

  await gameSession.save();
  return gameSession;
};

const calculateLifelinesUsed = (gameSession) => {
  return Object.values(gameSession.usedLifelines || {}).filter(Boolean).length;
};

const calculateAvgTimePerQuestion = (gameSession) => {
  if (!gameSession.questionTimes || gameSession.questionTimes.length === 0) {
    return 0;
  }

  const total = gameSession.questionTimes.reduce((sum, time) => sum + time, 0);
  return total / gameSession.questionTimes.length;
};

const updateLeaderboardForGame = async (
  userId,
  username,
  gameSession,
  gameWon = false,
) => {
  const currentLevel = gameSession.currentLevel;
  const moneyWon = gameWon
    ? MONEY_VALUES[currentLevel]
    : calculateSecuredMoney(currentLevel);
  const lifelinesUsed = calculateLifelinesUsed(gameSession);
  const avgTimePerQuestion = calculateAvgTimePerQuestion(gameSession);

  await updateLeaderboard(
    userId,
    username,
    moneyWon,
    Math.max(0, currentLevel - (gameWon ? 0 : 1)),
    gameWon,
    lifelinesUsed,
    avgTimePerQuestion,
  );

  return moneyWon;
};

export const startGame = async (req, res) => {
  try {
    const userId = req.user.id;
    let { gameId } = req.body;

    await endExistingGame(userId);

    if (!gameId) {
      const defaultGame = await findDefaultGame();
      if (!defaultGame) {
        return res.status(404).json({
          success: false,
          message: "No default game found in the system",
        });
      }
      gameId = defaultGame._id;
    }

    const game = await findGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const question = await findQuestionForLevel(game, 1);

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "No level 1 questions found for this game",
      });
    }

    const gameSession = await createGameSession(userId, gameId, question._id);

    return res.status(200).json({
      success: true,
      gameSessionId: gameSession._id,
      gameInfo: {
        id: game._id,
        title: game.title,
        theme: game.theme,
      },
      question: {
        id: question._id,
        text: question.question,
        options: question.options,
        level: 1,
        moneyAtStake: calculateMoneyAtStake(1),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to start game",
    });
  }
};

export const completeCustomGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    const gameSession = await GameSession.findOne({
      gameId,
      userId,
      status: "active",
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: "Game session not found",
      });
    }

    gameSession.status = "completed";
    gameSession.endTime = new Date();

    const user = await User.findById(userId);
    const moneyWon = await updateLeaderboardForGame(
      userId,
      user.username,
      gameSession,
      true,
    );

    gameSession.moneyWon = moneyWon;
    await gameSession.save();

    return res.status(200).json({
      success: true,
      message: "Custom game completed successfully",
      moneyWon: moneyWon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while completing the game",
    });
  }
};

export const quitGame = async (req, res) => {
  try {
    const { gameSessionId } = req.body;
    const userId = req.user.id;

    if (!gameSessionId) {
      return res.status(400).json({
        success: false,
        message: "Game session ID is required",
      });
    }

    const gameSession = await GameSession.findOne({
      _id: gameSessionId,
      userId,
      status: "active",
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: "Game session not found or already ended",
      });
    }

    gameSession.status = "quit";
    gameSession.endTime = new Date();

    const moneyWon = calculateSecuredMoney(gameSession.currentLevel);
    gameSession.moneyWon = moneyWon;
    await gameSession.save();

    await updateLeaderboard(
      userId,
      req.user.username,
      moneyWon,
      Math.max(0, gameSession.currentLevel - 1),
      false,
      calculateLifelinesUsed(gameSession),
      0,
    );

    return res.status(200).json({
      success: true,
      message: "Game quit successfully",
      moneyWon,
      status: "quit",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
