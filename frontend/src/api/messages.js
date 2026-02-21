import apiClient from './client';

/**
 * Service API pour les messages privés
 */

/**
 * Récupère l'historique des messages avec un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {number} limit - Nombre de messages à récupérer
 */
export const getMessages = async (userId, limit = 50) => {
    const response = await apiClient.get(`/messages/${userId}`, {
        params: { limit }
    });
    return response.data;
};

/**
 * Récupère la liste des conversations
 */
export const getConversations = async () => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
};

/**
 * Envoie un nouveau message
 * @param {object} messageData - Données du message
 */
export const sendMessage = async (messageData) => {
    const response = await apiClient.post('/messages', messageData);
    return response.data;
};

/**
 * Marque un message comme lu
 * @param {string} messageId - ID du message
 */
export const markMessageAsRead = async (messageId) => {
    const response = await apiClient.patch(`/messages/${messageId}/read`);
    return response.data;
};

/**
 * Récupère le nombre de messages non lus
 */
export const getUnreadCount = async () => {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
};

//Jour 2 fini avec succès  ouf