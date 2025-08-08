import mongoose from "../utils/db.js";

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    creatorName: {
      type: String,
      default: "System",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: "Classic",
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        options: {
          type: [String],
          required: true,
          validate: [
            function (val) {
              return val.length === 4;
            },
            "Question must have exactly 4 options",
          ],
        },
        correctAnswer: {
          type: String,
          required: true,
          enum: ["A", "B", "C", "D"],
        },
        difficulty: {
          type: Number,
          required: true,
          min: 1,
          max: 15,
        },
      },
    ],
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    playCount: {
      type: Number,
      default: 0,
    },
    maxLevel: {
      type: Number,
      default: 15,
      min: 1,
      max: 15,
    },
  },
  { timestamps: true },
);

const Game = mongoose.model("Game", gameSchema);

export default Game;
