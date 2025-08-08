import { Server } from "socket.io";

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // Your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.join("games");

    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on("getLeaderboard", async () => {
      try {
        const { getLeaderboard } = await import("./services/statsService.js");
        const leaderboard = await getLeaderboard();
        socket.emit("leaderboard:update", { leaderboard });
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        socket.emit("error", { message: "Failed to fetch leaderboard data" });
      }
    });

    socket.on("getUserStats", async ({ userId }) => {
      if (!userId) return;

      try {
        const { getUserStats } = await import("./services/statsService.js");
        const stats = await getUserStats(userId);
        socket.emit(`stats:update:${userId}`, { stats });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        socket.emit("error", { message: "Failed to fetch user stats" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  console.log("Socket.IO initialized");
  return io;
}

export function emitToGames(event, data) {
  if (io) {
    io.to("games").emit(event, data);
  }
}

export function updateLeaderboard(leaderboard) {
  if (io) {
    io.to("games").emit("leaderboard:update", { leaderboard });
  }
}

export function updateUserStats(userId, stats) {
  if (io) {
    io.emit(`stats:update:${userId}`, { stats });
  }
}

export function emitToRoom(room, event, data) {
  if (io) {
    io.to(room).emit(event, data);
  }
}

export function getIO() {
  return io;
}
