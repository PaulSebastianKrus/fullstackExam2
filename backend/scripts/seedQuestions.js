import mongoose from 'mongoose';
import Question from '../models/questionsModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to your database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Full set of questions covering all difficulty levels
const questions = [
  // Level 1 - Easiest ($100)
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "B",
    difficulty: 1,
    category: "Science"
  },
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "C",
    difficulty: 1,
    category: "Geography"
  },
  
  // Level 2 ($200)
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: "B",
    difficulty: 2,
    category: "Literature"
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: "B",
    difficulty: 2,
    category: "Science"
  },
  
  // Level 3 ($300)
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: "B",
    difficulty: 3,
    category: "Animals"
  },
  {
    question: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: "C",
    difficulty: 3,
    category: "History"
  },
  
  // Level 4 ($500)
  {
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["China", "Thailand", "Japan", "Korea"],
    correctAnswer: "C",
    difficulty: 4,
    category: "Geography"
  },
  {
    question: "Who painted the ceiling of the Sistine Chapel?",
    options: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"],
    correctAnswer: "B",
    difficulty: 4,
    category: "Art"
  },
  
  // Level 5 ($1,000)
  {
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctAnswer: "C",
    difficulty: 5,
    category: "Geography"
  },
  {
    question: "Which planet has the most moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: "B",
    difficulty: 5,
    category: "Science"
  },
  
  // Level 6 ($2,000)
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: "C",
    difficulty: 6,
    category: "Mathematics"
  },
  {
    question: "Which of these is NOT a noble gas?",
    options: ["Argon", "Xenon", "Nitrogen", "Neon"],
    correctAnswer: "C",
    difficulty: 6,
    category: "Science"
  },
  
  // Level 7 ($4,000)
  {
    question: "Which U.S. state is known as the 'Sunshine State'?",
    options: ["California", "Florida", "Hawaii", "Arizona"],
    correctAnswer: "B",
    difficulty: 7,
    category: "Geography"
  },
  {
    question: "Who is the author of the Harry Potter series?",
    options: ["J.R.R. Tolkien", "J.K. Rowling", "Stephen King", "George R.R. Martin"],
    correctAnswer: "B",
    difficulty: 7,
    category: "Literature"
  },
  
  // Level 8 ($8,000)
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Avocado", "Tomato", "Bell Pepper", "Onion"],
    correctAnswer: "A",
    difficulty: 8,
    category: "Food"
  },
  {
    question: "In which year was the first iPhone released?",
    options: ["2005", "2007", "2009", "2011"],
    correctAnswer: "B",
    difficulty: 8,
    category: "Technology"
  },
  
  // Level 9 ($16,000)
  {
    question: "What is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: "C",
    difficulty: 9,
    category: "Science"
  },
  {
    question: "Who wrote 'The Great Gatsby'?",
    options: ["Ernest Hemingway", "F. Scott Fitzgerald", "Mark Twain", "John Steinbeck"],
    correctAnswer: "B",
    difficulty: 9,
    category: "Literature"
  },
  
  // Level 10 ($32,000)
  {
    question: "What is the smallest bone in the human body?",
    options: ["Stapes", "Femur", "Radius", "Humerus"],
    correctAnswer: "A",
    difficulty: 10,
    category: "Biology"
  },
  {
    question: "Which country consumes the most coffee per capita?",
    options: ["United States", "Italy", "Finland", "Colombia"],
    correctAnswer: "C",
    difficulty: 10,
    category: "Food"
  },
  
  // Level 11 ($64,000)
  {
    question: "Who discovered penicillin?",
    options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Joseph Lister"],
    correctAnswer: "B",
    difficulty: 11,
    category: "Science"
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Ruby", "Diamond", "Titanium", "Platinum"],
    correctAnswer: "B",
    difficulty: 11,
    category: "Science"
  },
  
  // Level 12 ($125,000)
  {
    question: "In which year did the Chernobyl disaster occur?",
    options: ["1984", "1986", "1988", "1990"],
    correctAnswer: "B",
    difficulty: 12,
    category: "History"
  },
  {
    question: "Which element has the highest melting point?",
    options: ["Tungsten", "Platinum", "Titanium", "Carbon"],
    correctAnswer: "A",
    difficulty: 12,
    category: "Science"
  },
  
  // Level 13 ($250,000)
  {
    question: "Who was the first woman to win a Nobel Prize?",
    options: ["Marie Curie", "Rosalind Franklin", "Dorothy Hodgkin", "Barbara McClintock"],
    correctAnswer: "A",
    difficulty: 13,
    category: "History"
  },
  {
    question: "What is the rarest blood type in humans?",
    options: ["AB negative", "B negative", "O negative", "A negative"],
    correctAnswer: "A",
    difficulty: 13,
    category: "Biology"
  },
  
  // Level 14 ($500,000)
  {
    question: "Which ancient wonder was located in Alexandria?",
    options: ["Hanging Gardens", "Colossus", "Lighthouse", "Temple of Artemis"],
    correctAnswer: "C",
    difficulty: 14,
    category: "History"
  },
  {
    question: "What is the smallest country in the world by land area?",
    options: ["Monaco", "Nauru", "Vatican City", "Tuvalu"],
    correctAnswer: "C",
    difficulty: 14,
    category: "Geography"
  },
  
  // Level 15 ($1,000,000)
  {
    question: "In what year was the first Nobel Prize awarded?",
    options: ["1895", "1901", "1905", "1910"],
    correctAnswer: "B",
    difficulty: 15,
    category: "History"
  },
  {
    question: "Who is the only person to have won Nobel prizes in two different scientific fields?",
    options: ["Albert Einstein", "Marie Curie", "Linus Pauling", "Niels Bohr"],
    correctAnswer: "B",
    difficulty: 15,
    category: "Science"
  }
];

async function seedQuestions() {
  try {
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Add new questions
    await Question.insertMany(questions);
    console.log(`Added ${questions.length} questions across all difficulty levels`);
    
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedQuestions();