import { Server } from 'socket.io';

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // Your frontend URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join the games room for updates
    socket.join('games');
    
    // Handle joining specific rooms if needed
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });
    
    // Handle leaving rooms
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });
    
    // Handle direct leaderboard requests
    socket.on('getLeaderboard', async () => {
      try {
        // Import your service to fetch leaderboard data
        const { getLeaderboard } = await import('./services/statsService.js');
        const leaderboard = await getLeaderboard();
        socket.emit('leaderboard:update', { leaderboard });
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        socket.emit('error', { message: 'Failed to fetch leaderboard data' });
      }
    });
    
    // Handle user stats requests
    socket.on('getUserStats', async ({ userId }) => {
      if (!userId) return;
      
      try {
        // Import your service to fetch user stats
        const { getUserStats } = await import('./services/statsService.js');
        const stats = await getUserStats(userId);
        socket.emit(`stats:update:${userId}`, { stats });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        socket.emit('error', { message: 'Failed to fetch user stats' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket.IO initialized');
  return io;
}

// Function to emit events from anywhere in your app
export function emitToGames(event, data) {
  if (io) {
    io.to('games').emit(event, data);
  }
}

// Emit leaderboard updates to all clients in the games room
export function updateLeaderboard(leaderboard) {
  if (io) {
    io.to('games').emit('leaderboard:update', { leaderboard });
  }
}

// Emit user stat updates to all clients
export function updateUserStats(userId, stats) {
  if (io) {
    io.emit(`stats:update:${userId}`, { stats });
  }
}

// Function to emit to specific rooms
export function emitToRoom(room, event, data) {
  if (io) {
    io.to(room).emit(event, data);
  }
}

// Get the io instance
export function getIO() {
  return io;
}



