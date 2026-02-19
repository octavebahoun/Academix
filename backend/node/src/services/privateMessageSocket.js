/**
 * @file privateMessageSocket.js
 * @description Gestion des événements Socket.io pour le chat en temps réel.
 * Gère les connexions, les salles (rooms) par utilisateur et la diffusion des messages.
 */

const PrivateMessage = require('../models/PrivateMessage');
const logger = require('../utils/logger');

/**
 * Configuration des événements Socket.io pour les messages privés
 * @param {Object} io - Instance Socket.io
 */
module.exports = (io) => {
    // Namespace dédié aux messages privés
    const privateMessageNamespace = io.of('/private-messages');

    privateMessageNamespace.on('connection', (socket) => {
        logger.info(`User connected to private messages: ${socket.id}`);


        socket.on('user_online', (userId) => {
            if (!userId) {
                logger.error('user_online received without userId');
                return;
            }

            socket.userId = userId;
            socket.join(`user_${userId}`);
            logger.info(`User ${userId} joined room user_${userId}`);

            // Notifier les autres utilisateurs que cet utilisateur est en ligne
            socket.broadcast.emit('user_status_changed', {
                userId,
                status: 'online',
                timestamp: new Date().toISOString()
            });
        });

        socket.on('send_private_message', async (data) => {
            try {
                const { senderId, receiverId, content, type = 'text', file_url = null, sender_info, receiver_info } = data;

                // Validation
                if (!senderId || !receiverId || !content) {
                    socket.emit('message_error', {
                        error: 'senderId, receiverId et content sont requis'
                    });
                    return;
                }

                // Sauvegarde en base de données (source de vérité)
                const message = new PrivateMessage({
                    sender: parseInt(senderId),
                    receiver: parseInt(receiverId),
                    content,
                    type,
                    file_url,
                    sender_info: sender_info || {},
                    receiver_info: receiver_info || {}
                });

                await message.save();
                logger.info(`Message saved: ${senderId} -> ${receiverId}`);

                // Préparer le message pour l'envoi temps réel
                const messagePayload = {
                    _id: message._id,
                    sender: message.sender,
                    receiver: message.receiver,
                    content: message.content,
                    type: message.type,
                    file_url: message.file_url,
                    sender_info: message.sender_info,
                    receiver_info: message.receiver_info,
                    read: message.read,
                    createdAt: message.createdAt,
                    updatedAt: message.updatedAt
                };

                // Confirmer au sender
                socket.emit('message_sent', {
                    success: true,
                    message: messagePayload
                });

                // Envoyer au receiver s'il est connecté
                privateMessageNamespace.to(`user_${receiverId}`).emit('new_message', messagePayload);

                logger.info(`Message emitted to user_${receiverId}`);

            } catch (error) {
                logger.error('Error sending private message:', error);
                socket.emit('message_error', {
                    error: 'Erreur lors de l\'envoi du message',
                    details: error.message
                });
            }
        });

        socket.on('mark_as_read', async (data) => {
            try {
                const { senderId, receiverId } = data;

                if (!senderId || !receiverId) {
                    return;
                }

                await PrivateMessage.markAsRead(parseInt(senderId), parseInt(receiverId));

                // Notifier l'expéditeur que ses messages ont été lus
                privateMessageNamespace.to(`user_${senderId}`).emit('messages_read', {
                    readBy: receiverId,
                    timestamp: new Date().toISOString()
                });

                logger.info(`Messages marked as read: ${senderId} -> ${receiverId}`);
            } catch (error) {
                logger.error('Error marking messages as read:', error);
            }
        });

        socket.on('typing_start', (data) => {
            const { senderId, receiverId } = data;

            if (!receiverId) return;

            privateMessageNamespace.to(`user_${receiverId}`).emit('user_typing', {
                userId: senderId,
                isTyping: true
            });
        });


        socket.on('typing_stop', (data) => {
            const { senderId, receiverId } = data;

            if (!receiverId) return;

            privateMessageNamespace.to(`user_${receiverId}`).emit('user_typing', {
                userId: senderId,
                isTyping: false
            });
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                // Notifier que l'utilisateur est hors ligne
                socket.broadcast.emit('user_status_changed', {
                    userId: socket.userId,
                    status: 'offline',
                    timestamp: new Date().toISOString()
                });

                logger.info(`User ${socket.userId} disconnected from private messages`);
            }
        });
    });

    return privateMessageNamespace;
};
