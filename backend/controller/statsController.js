import Leaderboard from '../models/leaderboardModel.js';
import GameSession from '../models/gameSessionModel.js';
import { updateLeaderboard as emitLeaderboardUpdate, updateUserStats as emitUserStatsUpdate } from '../socket.js';

export const updateLeaderboard = async (userId, username, moneyWon, level, gameWon, lifelinesUsed, avgTimePerQuestion) => {
  try {
    if (!userId) {
      return;
    }
    
    let leaderboardEntry = await Leaderboard.findOne({ userId });
    
    if (!leaderboardEntry) {
      leaderboardEntry = new Leaderboard({
        userId,
        username,
        highestScore: 0,
        totalEarnings: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        highestLevel: 0,
        lifelinesUsed: 0,
        averageTimePerQuestion: 0
      });
    }
    
    leaderboardEntry.gamesPlayed += 1;
    
    if (gameWon) {
      leaderboardEntry.gamesWon += 1;
    }
    
    leaderboardEntry.totalEarnings += moneyWon || 0;
    
    if ((moneyWon || 0) > leaderboardEntry.highestScore) {
      leaderboardEntry.highestScore = moneyWon;
    }
    
    if ((level || 0) > leaderboardEntry.highestLevel) {
      leaderboardEntry.highestLevel = level;
    }
    
    leaderboardEntry.lifelinesUsed += lifelinesUsed || 0;
    
    if (avgTimePerQuestion > 0) {
      const oldAvg = leaderboardEntry.averageTimePerQuestion || 0;
      const oldGames = Math.max(0, leaderboardEntry.gamesPlayed - 1);
      
      if (oldGames > 0) {
        leaderboardEntry.averageTimePerQuestion = 
          (oldAvg * oldGames + avgTimePerQuestion) / leaderboardEntry.gamesPlayed;
      } else {
        leaderboardEntry.averageTimePerQuestion = avgTimePerQuestion;
      }
    }
    
    leaderboardEntry.lastPlayed = new Date();
    
    await leaderboardEntry.save();
    
    try {
      const updatedLeaderboard = await Leaderboard.find()
        .sort({ highestScore: -1 })
        .limit(100);
        
      const userStats = await getUserStatsById(userId);
      
      emitLeaderboardUpdate(updatedLeaderboard);
      
      if (userStats) {
        emitUserStatsUpdate(userId, userStats);
      }
    } catch (socketError) {
    }
    
  } catch (error) {
  }
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