import mongoose from '../utils/db.js';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [
      function(val) { return val.length === 4; },
      'Question must have exactly 4 options'
    ]
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 15
  },
  category: {
    type: String,
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;