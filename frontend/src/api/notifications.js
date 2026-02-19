import apiClient from './client';

export const getNotifications = async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
};

export const getNotificationUnreadCount = async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
};

export const markNotificationAsRead = async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
};
