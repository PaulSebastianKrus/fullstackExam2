import mongoose from '../utils/db.js';
import Game from '../models/gameModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateGamesWithMaxLevel() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Finding games without maxLevel...');
    const games = await Game.find({ maxLevel: { $exists: false } });
    
    console.log(`Found ${games.length} games that need updating`);
    
    for (const game of games) {
      // Analyze the game's questions to determine the max level
      let maxLevelInQuestions = 0;
      
      if (game.questions && game.questions.length > 0) {
        // For custom games with embedded questions
        game.questions.forEach(q => {
          if (q.difficulty > maxLevelInQuestions) {
            maxLevelInQuestions = q.difficulty;
          }
        });
      }
      
      // Set maxLevel based on available questions or default to 15
      game.maxLevel = maxLevelInQuestions || 15;
      
      await game.save();
      console.log(`Updated game "${game.title}" with maxLevel = ${game.maxLevel}`);
    }
    
    console.log('Database update complete!');
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

updateGamesWithMaxLevel();