/**
 * @file privateMessages.js
 * @description Routes pour les messages privés (chat 1-to-1)
 */

const express = require('express');
const router = express.Router();
const privateMessageController = require('../controllers/privateMessageController');
const auth = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(auth);

/**
 * GET /api/messages/conversations
 * Récupère la liste des conversations avec le dernier message
 */
router.get('/conversations', privateMessageController.getConversations);

/**
 * GET /api/messages/unread-count
 * Nombre total de messages non lus
 */
router.get('/unread-count', privateMessageController.getUnreadCount);

/**
 * GET /api/messages/:userId
 * Récupère l'historique de conversation avec un utilisateur
 */
router.get('/:userId', privateMessageController.getMessages);

/**
 * POST /api/messages
 * Envoie un nouveau message (persistance uniquement, le temps réel est géré par Socket.io)
 */
router.post('/', privateMessageController.sendMessage);

/**
 * PATCH /api/messages/:messageId/read
 * Marque un message comme lu
 */
router.patch('/:messageId/read', privateMessageController.markMessageAsRead);

module.exports = router;
