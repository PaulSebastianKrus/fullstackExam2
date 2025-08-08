import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    highestLevel: {
      type: Number,
      default: 0,
    },
    lifelinesUsed: {
      type: Number,
      default: 0,
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0,
    },
    lastPlayed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

leaderboardSchema.index({ highestScore: -1 });

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
export default Leaderboard;
