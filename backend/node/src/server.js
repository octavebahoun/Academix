/**
 * @file server.js
 * @description Point d'entrée principal du serveur Node.js AcademiX.
 * Configure et démarre le serveur Express avec Socket.io pour gérer
 * les communications en temps réel (chat, notifications, sessions collaboratives).
 * Intègre MongoDB pour la persistance et Redis pour le pub/sub.
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const logger = require('./utils/logger');

// Import des routes
const privateMessagesRoutes = require('./routes/privateMessages');
const sessionsRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const notificationsRoutes = require('./routes/notifications');

// Import des services Socket.io
const privateMessageSocket = require('./services/privateMessageSocket');
const socketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const allowedOrigins = (
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (origin.includes('ngrok-free.app') || origin.includes('ngrok.app')) {
    return true;
  }
  return allowedOrigins.includes(origin);
};

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsRoot = process.env.UPLOAD_BASE_PATH || path.join(process.cwd(), 'uploads', 'chat');
fs.mkdirSync(uploadsRoot, { recursive: true });
app.use('/uploads/chat', express.static(uploadsRoot));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    console.log('MongoDB connecté avec succès');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1);
  });

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'AcademiX WebSocket Server',
    status: 'running',
    features: ['Private Messages', 'Real-time Chat', 'Notifications']
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Node.js opérationnel !',
    data: {
      server: 'AcademiX Node Backend',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      features: ['MongoDB', 'Socket.io', 'Private Messages']
    }
  });
});

app.post('/api/test/echo', (req, res) => {
  res.json({
    success: true,
    message: 'Echo de votre requête',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/hello/:name', (req, res) => {
  const { name } = req.params;
  res.json({
    success: true,
    message: `Bonjour ${name} ! Le serveur fonctionne correctement.`,
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/messages', privateMessagesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);

// Initialisation des services Socket.io
privateMessageSocket(io);
socketService(io);

// Socket.io - Connexion de base (pour compatibilité)
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    console.log('Client disconnected:', socket.id);
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for real-time connections`);
  console.log(`Private Messages: ws://localhost:${PORT}/private-messages`);
});
