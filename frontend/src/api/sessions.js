import apiClient from './client';

export const getSessions = async (params = {}) => {
  const response = await apiClient.get('/sessions', { params });
  return response.data;
};

export const createSession = async (payload) => {
  const response = await apiClient.post('/sessions', payload);
  return response.data;
};

export const joinSession = async (sessionId) => {
  const response = await apiClient.post(`/sessions/${sessionId}/join`);
  return response.data;
};

export const rateSession = async (sessionId, payload) => {
  const response = await apiClient.post(`/sessions/${sessionId}/rate`, payload);
  return response.data;
};
