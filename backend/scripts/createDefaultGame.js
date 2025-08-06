import mongoose from '../utils/db.js';
import Game from '../models/gameModel.js';
import Question from '../models/questionsModel.js';

async function createDefaultGame() {
  try {
    console.log('Connected to MongoDB');
    
    // Get all questions for reference
    const allQuestions = await Question.find().lean();
    
    if (allQuestions.length === 0) {
      console.log('No questions found. Run seedQuestions.js first!');
      return;
    }
    
    console.log(`Found ${allQuestions.length} questions to use`);
    
    // Create a default game
    const defaultGame = new Game({
      title: "Classic Millionaire",
      description: "The standard Who Wants to Be a Millionaire game",
      isDefault: true,
      theme: "Classic",
      // Store IDs of all questions for the standard game
      questionIds: allQuestions.map(q => q._id)
    });
    
    await defaultGame.save();
    console.log('Created default game with ID:', defaultGame._id);
    
  } catch (error) {
    console.error('Error creating default game:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createDefaultGame();