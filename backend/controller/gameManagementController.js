import Game from "../models/gameModel.js";
import { emitToGames } from "../socket.js";

export const listGames = async (req, res) => {
  try {
    const games = await Game.find()
      .select(
        "_id title description theme creatorName playCount isDefault questions",
      )
      .sort({ isDefault: -1, playCount: -1 });

    const gamesWithStats = games.map((game) => ({
      _id: game._id,
      title: game.title,
      description: game.description,
      theme: game.theme,
      creatorName: game.creatorName,
      playCount: game.playCount,
      isDefault: game.isDefault,
      questionCount: game.questions.length,
    }));

    res.status(200).json({
      success: true,
      games: gamesWithStats,
    });
  } catch (error) {
    console.error("Error listing games:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve games",
    });
  }
};

export const createGame = async (req, res) => {
  try {
    const { title, description, theme, questions, maxLevel } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const newGame = new Game({
      title,
      description,
      theme,
      questions,
      maxLevel: maxLevel || 15,
      creatorId: req.user.id,
      creatorName: req.user.username,
      isDefault: false,
      questionCount: questions.length,
      playCount: 0,
    });

    await newGame.save();

    emitToGames("gameCreated", {
      game: newGame,
      message: `New game "${newGame.title}" created by ${newGame.creatorName}`,
    });

    res.status(201).json({
      success: true,
      message: "Game created successfully",
      gameId: newGame._id,
      game: newGame,
    });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create game",
    });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    if (game.creatorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete games you have created",
      });
    }

    await Game.findByIdAndDelete(id);

    emitToGames("gameDeleted", {
      gameId: id,
      message: `Game "${game.title}" has been deleted`,
    });

    return res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete game",
    });
  }
};
