import mongoose from "mongoose";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/fullstackExam2";

mongoose.connect(MONGODB_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {});

export default mongoose;
