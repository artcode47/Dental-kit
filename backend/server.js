require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./utils/socketHandler');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Initialize socket handler
socketHandler(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection failed:', error);
  // Start server anyway for now
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without database)`);
  });
}); 