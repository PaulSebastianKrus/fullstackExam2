import { createServer } from "http";
import app from "./app.js";
import mongoose from "./utils/db.js";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

mongoose.connection.once("open", () => {
  console.log("Database connected successfully.");

  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Socket.IO server is ready for connections");
  });
});

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to the database:", error);
});
