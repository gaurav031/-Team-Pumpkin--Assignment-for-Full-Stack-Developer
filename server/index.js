// server.js
import app from './app.js';
import { sequelize } from './config/database.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to other modules
app.set('io', io);

// Test database connection and sync models
try {
  await sequelize.authenticate();
  console.log('Database connection has been established successfully.');
  await sequelize.sync({ alter: true });
  console.log('Database synchronized');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});