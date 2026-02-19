/**
 * @file privateMessageController.js
 * @description Contrôleur pour gérer les messages privés entre utilisateurs.
 * Gère les routes REST pour récupérer l'historique, envoyer des messages
 * et obtenir la liste des conversations.
 */

const PrivateMessage = require('../models/PrivateMessage');
const logger = require('../utils/logger');

/**
 * GET /messages/:userId
 * Récupère l'historique des messages entre l'utilisateur connecté et un autre utilisateur
 */
exports.getMessages = async (req, res) => {
    try {
        const currentUserId = req.user.id; // Depuis le middleware auth
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const messages = await PrivateMessage.getConversation(
            currentUserId,
            parseInt(userId),
            limit
        );

        // Marquer les messages comme lus
        await PrivateMessage.markAsRead(parseInt(userId), currentUserId);

        res.json({
            success: true,
            messages: messages.reverse(), // Du plus ancien au plus récent
            count: messages.length
        });
    } catch (error) {
        logger.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des messages',
            error: error.message
        });
    }
};

/**
 * GET /messages/conversations
 * Récupère la liste des conversations avec le dernier message de chaque conversation
 */
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Agrégation pour obtenir les derniers messages par conversation
        const conversations = await PrivateMessage.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ],
                    is_deleted: false
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', currentUserId] },
                            '$receiver',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiver', currentUserId] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.json({
            success: true,
            conversations: conversations.map(conv => ({
                userId: conv._id,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount
            })),
            count: conversations.length
        });
    } catch (error) {
        logger.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des conversations',
            error: error.message
        });
    }
};

/**
 * POST /messages
 * Enregistre un nouveau message en base de données
 */
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content, type = 'text', file_url = null } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'receiverId et content sont requis'
            });
        }

        const message = new PrivateMessage({
            sender: senderId,
            receiver: parseInt(receiverId),
            content,
            type,
            file_url,
            sender_info: {
                nom: req.user.nom,
                prenom: req.user.prenom,
                avatar_url: req.user.avatar_url
            },
            receiver_info: req.body.receiver_info || {}
        });

        await message.save();

        res.status(201).json({
            success: true,
            message: message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message',
            error: error.message
        });
    }
};

/**
 * PATCH /messages/:messageId/read
 * Marque un message comme lu
 */
exports.markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id;

        const message = await PrivateMessage.findOne({
            _id: messageId,
            receiver: currentUserId
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message non trouvé'
            });
        }

        message.read = true;
        message.read_at = new Date();
        await message.save();

        res.json({
            success: true,
            message: 'Message marqué comme lu'
        });
    } catch (error) {
        logger.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage du message',
            error: error.message
        });
    }
};

/**
 * GET /messages/unread-count
 * Récupère le nombre total de messages non lus
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const count = await PrivateMessage.countDocuments({
            receiver: currentUserId,
            read: false,
            is_deleted: false
        });

        res.json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        logger.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du compteur',
            error: error.message
        });
    }
};
