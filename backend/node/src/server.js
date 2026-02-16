const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes de test
app.get('/', (req, res) => {
  res.json({ message: 'AcademiX WebSocket Server', status: 'running' });
});

// Health check pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint avec données
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Node.js opérationnel !',
    data: {
      server: 'AcademiX Node Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Test POST endpoint
app.post('/api/test/echo', (req, res) => {
  res.json({
    success: true,
    message: 'Echo de votre requête',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Endpoint pour tester les paramètres
app.get('/api/test/hello/:name', (req, res) => {
  const { name } = req.params;
  res.json({
    success: true,
    message: `Bonjour ${name} ! Le serveur fonctionne correctement.`,
    timestamp: new Date().toISOString()
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
