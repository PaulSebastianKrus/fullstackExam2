import GameSession from "../models/gameSessionModel.js";
import Game from "../models/gameModel.js";
import Question from "../models/questionsModel.js";
import {
  MONEY_VALUES,
  calculateMoneyAtStake,
  calculateSecuredMoney,
} from "../utils/gameConstants.js";
import { updateLeaderboard } from "./leaderboardController.js";
import User from "../models/userModel.js";

const findQuestion = async (game, questionId) => {
  let question = null;

  if (game.questions && game.questions.length > 0) {
    question = game.questions.id(questionId);
  }

  if (!question) {
    question = await Question.findById(questionId);
  }

  return question;
};

const findQuestionsForLevel = async (game, level) => {
  let levelQuestions = [];

  if (game.questions && game.questions.length > 0) {
    levelQuestions = game.questions.filter((q) => q.difficulty === level);
  }

  if (
    levelQuestions.length === 0 &&
    game.questionIds &&
    game.questionIds.length > 0
  ) {
    levelQuestions = await Question.find({
      _id: { $in: game.questionIds },
      difficulty: level,
    });
  }

  return levelQuestions;
};

const handleGameWin = async (gameSession, userId) => {
  gameSession.status = "completed";
  gameSession.endTime = new Date();
  gameSession.moneyWon = MONEY_VALUES[gameSession.currentLevel];
  await gameSession.save();

  const prizeAmount = MONEY_VALUES[gameSession.currentLevel];

  const lifelinesUsed = Object.values(gameSession.lifelines || {}).filter(
    Boolean,
  ).length;

  let avgTimePerQuestion = 0;
  if (gameSession.questionTimes && gameSession.questionTimes.length > 0) {
    avgTimePerQuestion =
      gameSession.questionTimes.reduce((sum, time) => sum + time, 0) /
      gameSession.questionTimes.length;
  }

  const user = await User.findById(userId);
  if (user) {
    await updateLeaderboard(
      userId,
      user.username,
      prizeAmount,
      gameSession.currentLevel,
      true,
      lifelinesUsed,
      avgTimePerQuestion,
    );
  }

  return {
    success: true,
    status: "won",
    moneyWon: prizeAmount,
  };
};

const handleGameLoss = async (gameSession, userId) => {
  gameSession.status = "failed";
  gameSession.endTime = new Date();
  await gameSession.save();

  const moneyWon = calculateSecuredMoney(gameSession.currentLevel);
  gameSession.moneyWon = moneyWon;
  await gameSession.save();

  const lifelinesUsed = Object.values(gameSession.lifelines || {}).filter(
    Boolean,
  ).length;

  let avgTimePerQuestion = 0;
  if (gameSession.questionTimes && gameSession.questionTimes.length > 0) {
    const totalTime = gameSession.questionTimes.reduce(
      (sum, time) => sum + time,
      0,
    );
    avgTimePerQuestion = Math.round(
      totalTime / gameSession.questionTimes.length,
    );
  }

  const user = await User.findById(userId);
  if (user) {
    await updateLeaderboard(
      userId,
      user.username,
      moneyWon,
      Math.max(0, gameSession.currentLevel - 1),
      false,
      lifelinesUsed,
      avgTimePerQuestion,
    );
  }

  return {
    success: true,
    correct: false,
    status: "lost",
    moneyWon: moneyWon,
    message: "Wrong answer! Game over.",
  };
};

const processFiftyFifty = (currentQuestion) => {
  const correctIndex = ["A", "B", "C", "D"].indexOf(
    currentQuestion.correctAnswer,
  );

  const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex);

  const keepWrongIndex =
    wrongIndices[Math.floor(Math.random() * wrongIndices.length)];

  const fiftyFiftyOptions = ["A", "B", "C", "D"].filter(
    (_, i) => i === correctIndex || i === keepWrongIndex,
  );

  const remainingOptions = currentQuestion.options.map((option, i) =>
    i === correctIndex || i === keepWrongIndex ? option : null,
  );

  return {
    fiftyFiftyOptions,
    remainingOptions,
  };
};

const processPhoneAFriend = (currentQuestion) => {
  const correctIndex = ["A", "B", "C", "D"].indexOf(
    currentQuestion.correctAnswer,
  );
  const correctLetter = ["A", "B", "C", "D"][correctIndex];

  const isCorrect = Math.random() < 0.8;

  if (isCorrect) {
    return {
      friendAnswer: correctLetter,
      confidence: Math.floor(Math.random() * 30) + 70,
    };
  } else {
    let wrongAnswer;
    do {
      wrongAnswer = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
    } while (wrongAnswer === correctLetter);

    return {
      friendAnswer: wrongAnswer,
      confidence: Math.floor(Math.random() * 40) + 50,
    };
  }
};

const processAskAudience = (currentQuestion) => {
  const audienceResults = { A: 0, B: 0, C: 0, D: 0 };
  const letters = ["A", "B", "C", "D"];

  const correctPercentage = Math.floor(Math.random() * 36) + 40;
  audienceResults[currentQuestion.correctAnswer] = correctPercentage;

  const remaining = 100 - correctPercentage;

  const wrongLetters = letters.filter(
    (letter) => letter !== currentQuestion.correctAnswer,
  );

  let allocated = 0;
  for (let i = 0; i < wrongLetters.length; i++) {
    const letter = wrongLetters[i];
    if (i === wrongLetters.length - 1) {
      audienceResults[letter] = remaining - allocated;
    } else {
      const max = remaining - allocated - (wrongLetters.length - i - 1);
      const portion = max > 0 ? Math.floor(Math.random() * max) + 1 : 0;
      audienceResults[letter] = portion;
      allocated += portion;
    }
  }

  return { audienceResults };
};

export const submitAnswer = async (req, res) => {
  try {
    const { gameSessionId, answer } = req.body;
    const userId = req.user.id;

    const gameSession = await GameSession.findOne({
      _id: gameSessionId,
      userId,
      status: "active",
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: "No active game session found",
      });
    }

    const game = await Game.findById(gameSession.gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const currentQuestion = await findQuestion(
      game,
      gameSession.currentQuestion,
    );

    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        message: "Current question not found",
      });
    }

    const isCorrect = currentQuestion.correctAnswer === answer;

    if (isCorrect) {
      if (
        gameSession.currentLevel === (game.maxLevel || 15) ||
        gameSession.currentLevel === 15
      ) {
        return res.status(200).json(await handleGameWin(gameSession, userId));
      }

      const nextLevel = gameSession.currentLevel + 1;

      const nextLevelQuestions = await findQuestionsForLevel(game, nextLevel);

      if (nextLevelQuestions.length === 0) {
        return res.status(200).json(await handleGameWin(gameSession, userId));
      }

      const randomIndex = Math.floor(Math.random() * nextLevelQuestions.length);
      const nextQuestion = nextLevelQuestions[randomIndex];

      gameSession.currentLevel = nextLevel;
      gameSession.currentQuestion = nextQuestion._id;
      await gameSession.save();

      return res.status(200).json({
        success: true,
        correct: true,
        status: "active",
        nextQuestion: {
          text: nextQuestion.question,
          options: nextQuestion.options,
          level: gameSession.currentLevel + 1,
          moneyAtStake: calculateMoneyAtStake(gameSession.currentLevel),
        },
        level: nextLevel,
        moneyAtStake: calculateMoneyAtStake(nextLevel),
      });
    } else {
      return res.status(200).json(await handleGameLoss(gameSession, userId));
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process answer",
    });
  }
};

export const useLifeline = async (req, res) => {
  try {
    const { gameSessionId, lifeline } = req.body;
    const userId = req.user.id;

    if (!["fiftyFifty", "phoneAFriend", "askAudience"].includes(lifeline)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lifeline type",
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
        message: "No active game session found",
      });
    }

    if (gameSession.lifelines[lifeline]) {
      return res.status(400).json({
        success: false,
        message: "This lifeline has already been used",
      });
    }

    const game = await Game.findById(gameSession.gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const currentQuestion = await findQuestion(
      game,
      gameSession.currentQuestion,
    );

    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        message: "Current question not found",
      });
    }

    gameSession.lifelines[lifeline] = true;
    await gameSession.save();

    let result = {};

    if (lifeline === "fiftyFifty") {
      result = processFiftyFifty(currentQuestion);
    } else if (lifeline === "phoneAFriend") {
      result = processPhoneAFriend(currentQuestion);
    } else if (lifeline === "askAudience") {
      result = processAskAudience(currentQuestion);
    }

    return res.status(200).json({
      success: true,
      lifeline,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to use lifeline",
    });
  }
};
