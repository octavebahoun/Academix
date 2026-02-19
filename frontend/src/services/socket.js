import { io } from 'socket.io-client';

const DEFAULT_SOCKET_URL =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL;

class SocketService {
    constructor() {
        this.socket = null;
        this.privateMessageSocket = null;
    }

    /**
     * Connecte au serveur Socket.io
     */
    connect(token) {
        // Connexion au namespace des messages privés
        this.privateMessageSocket = io(`${SOCKET_URL}/private-messages`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.privateMessageSocket.on('connect', () => {
            console.log('✅ Connected to private messages socket');
        });

        this.privateMessageSocket.on('disconnect', () => {
            console.log('❌ Disconnected from private messages socket');
        });

        this.privateMessageSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.privateMessageSocket;
    }

    /**
     * Notifie que l'utilisateur est en ligne
     */
    userOnline(userId) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.emit('user_online', userId);
        }
    }

    /**
     * Envoie un message privé
     */
    sendPrivateMessage(messageData) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.emit('send_private_message', messageData);
        }
    }

    /**
     * Écoute les nouveaux messages
     */
    onNewMessage(callback) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.on('new_message', callback);
        }
    }

    /**
     * Écoute la confirmation d'envoi
     */
    onMessageSent(callback) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.on('message_sent', callback);
        }
    }

    /**
     * Écoute les erreurs de message
     */
    onMessageError(callback) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.on('message_error', callback);
        }
    }

    /**
     * Marque les messages comme lus
     */
    markAsRead(senderId, receiverId) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.emit('mark_as_read', { senderId, receiverId });
        }
    }

    /**
     * Écoute les messages lus
     */
    onMessagesRead(callback) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.on('messages_read', callback);
        }
    }

    /**
     * Notifie que l'utilisateur tape
     */
    typingStart(senderId, receiverId) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.emit('typing_start', { senderId, receiverId });
        }
    }

    /**
     * Notifie que l'utilisateur a arrêté de taper
     */
    typingStop(senderId, receiverId) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.emit('typing_stop', { senderId, receiverId });
        }
    }

    /**
     * Écoute l'indicateur de frappe
     */
    onUserTyping(callback) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.on('user_typing', callback);
        }
    }

    /**
     * Écoute les changements de statut
     */
    onUserStatusChanged(callback) {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.on('user_status_changed', callback);
        }
    }

    /**
     * Déconnecte le socket
     */
    disconnect() {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.disconnect();
            this.privateMessageSocket = null;
        }
    }

    /**
     * Supprime tous les listeners
     */
    removeAllListeners() {
        if (this.privateMessageSocket) {
            this.privateMessageSocket.removeAllListeners();
        }
    }
}

// Export d'une instance singleton
export default new SocketService();
