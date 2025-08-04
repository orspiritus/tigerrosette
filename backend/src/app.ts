import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import duelsRoutes from './routes/duels';
// import userRoutes from './routes/user';
// import achievementsRoutes from './routes/achievements';
// import economyRoutes from './routes/economy';
// import multiplayerRoutes from './routes/multiplayer';

// Import WebSocket handlers (to be created)
// import { initializeSocketHandlers } from './websocket';

const app = express();
const server = createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(server, {
  cors: corsOptions,
});

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/duels', duelsRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/achievements', achievementsRoutes);
// app.use('/api/economy', economyRoutes);
// app.use('/api/multiplayer', multiplayerRoutes);

// WebSocket initialization (to be uncommented when implemented)
// initializeSocketHandlers(io);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS origins: ${config.cors.origins.join(', ')}`);
});

export { app, server, io };
