import Leaderboard from '../models/leaderboardModel.js';
import GameSession from '../models/gameSessionModel.js';
import { updateLeaderboard as emitLeaderboardUpdate, updateUserStats as emitUserStatsUpdate } from '../socket.js';

export const updateLeaderboard = async (userId, username, moneyWon, level, gameWon, lifelinesUsed, avgTimePerQuestion) => {
  try {
    // Find existing leaderboard entry for the user
    let leaderboardEntry = await Leaderboard.findOne({ userId });
    
    if (leaderboardEntry) {
      // Update existing entry
      leaderboardEntry.totalEarnings += moneyWon; // ADD the money won, don't replace
      leaderboardEntry.gamesPlayed += 1;
      
      if (gameWon) {
        leaderboardEntry.gamesWon += 1;
      }
      
      if (level > leaderboardEntry.highestLevel) {
        leaderboardEntry.highestLevel = level;
      }
      
      // Update score (use your scoring formula)
      const newScore = calculateScore(moneyWon, level, gameWon);
      if (newScore > leaderboardEntry.highestScore) {
        leaderboardEntry.highestScore = newScore;
      }
      
      // Update other stats
      leaderboardEntry.lifelinesUsed += lifelinesUsed;
      
      // Calculate new average time per question
      const totalQuestions = leaderboardEntry.gamesPlayed * 15; // adjust if needed
      leaderboardEntry.averageTimePerQuestion = 
        ((leaderboardEntry.averageTimePerQuestion * (totalQuestions - 15)) + (avgTimePerQuestion * 15)) / totalQuestions;
      
      await leaderboardEntry.save();
    } else {
      // Create new entry
      leaderboardEntry = new Leaderboard({
        userId,
        username,
        totalEarnings: moneyWon,
        highestScore: calculateScore(moneyWon, level, gameWon),
        gamesPlayed: 1,
        gamesWon: gameWon ? 1 : 0,
        highestLevel: level,
        lifelinesUsed: lifelinesUsed,
        averageTimePerQuestion: avgTimePerQuestion
      });
      
      await leaderboardEntry.save();
    }
    
    // Get updated leaderboard
    const updatedLeaderboard = await Leaderboard.find()
      .sort({ highestScore: -1 })
      .limit(20);
    
    // Emit updates via socket
    try {
      const userStats = await getUserStatsById(userId);
      emitLeaderboardUpdate(updatedLeaderboard);
      
      if (userStats) {
        emitUserStatsUpdate(userId, userStats);
      }
    } catch (socketError) {
      console.error('Socket error:', socketError);
    }
    
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

// Helper function to calculate score
const calculateScore = (moneyWon, level, gameWon) => {
  // Map level to prize amount directly (WWTBAM prize structure)
  const prizeValues = {
    1: 100,
    2: 200,
    3: 300,
    4: 500,
    5: 1000,
    6: 2000,
    7: 4000,
    8: 8000,
    9: 16000,
    10: 32000,
    11: 64000,
    12: 125000,
    13: 250000,
    14: 500000,
    15: 1000000
  };
  
  // Return the prize value for the level reached
  return prizeValues[level] || 0;
};

const getUserStatsById = async (userId) => {
  try {
    const leaderboardEntry = await Leaderboard.findOne({ userId });
    
    if (!leaderboardEntry) {
      return null;
    }
    
    const rank = await Leaderboard.countDocuments({ 
      highestScore: { $gt: leaderboardEntry.highestScore }
    });
    
    return {
      highestScore: leaderboardEntry.highestScore,
      totalEarnings: leaderboardEntry.totalEarnings,
      gamesPlayed: leaderboardEntry.gamesPlayed,
      gamesWon: leaderboardEntry.gamesWon,
      highestLevel: leaderboardEntry.highestLevel,
      lifelinesUsed: leaderboardEntry.lifelinesUsed,
      averageTimePerQuestion: leaderboardEntry.averageTimePerQuestion,
      rank: rank + 1 
    };
  } catch (error) {
    return null;
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    
    const leaderboard = await Leaderboard.find()
      .sort({ highestScore: -1 })
      .limit(100);
        
    res.json({ 
      success: true, 
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leaderboard data' 
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await getUserStatsById(userId);
    
    if (!stats) {
      return res.json({
        success: true,
        stats: {
          highestScore: 0,
          totalEarnings: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          highestLevel: 0,
          lifelinesUsed: 0,
          averageTimePerQuestion: 0,
          rank: null
        }
      });
    }
        
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
};

export const getUserGameHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const gameHistory = await GameSession.find({ userId })
      .sort({ endTime: -1 })
      .limit(10);
    
    const formattedHistory = gameHistory.map(game => ({
      gameId: game._id,
      date: game.endTime || game.startTime,
      status: game.status,
      moneyWon: game.moneyWon,
      levelReached: game.currentLevel,
      duration: game.endTime ? Math.round((game.endTime - game.startTime) / 1000) : null
    }));
    
    res.json({
      success: true,
      history: formattedHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game history'
    });
  }
};