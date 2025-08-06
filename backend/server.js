import { createServer } from 'http';
import app from './app.js';
import mongoose from './utils/db.js';
import { initializeSocket } from './socket.js';

const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Wait for MongoDB connection before starting the server
mongoose.connection.once('open', () => {
  console.log('Database connected successfully.');

  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Socket.IO server is ready for connections');
  });
});

mongoose.connection.on('error', (error) => {
  console.error('Error connecting to the database:', error);
});