import mongoose from "../utils/db.js";

const gameSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    currentLevel: {
      type: Number,
      default: 1,
    },
    currentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    lifelines: {
      fiftyFifty: { type: Boolean, default: false },
      phoneAFriend: { type: Boolean, default: false },
      askAudience: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed", "abandoned", "quit"],
      default: "active",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
  },
  { timestamps: true },
);

const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
