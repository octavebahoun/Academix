import apiClient from './client';


export const getSessionMessages = async (sessionId, options = {}) => {
  const { limit = 60, page, before } = options;
  const response = await apiClient.get(`/chat/${sessionId}/messages`, {
    params: { limit, page, before }
  });
  return response.data;
};



export const getSessionParticipants = async (sessionId, role) => {
  const response = await apiClient.get(`/chat/${sessionId}/participants`, {
    params: role ? { role } : undefined
  });
  return response.data;
};

export const getMentionSuggestions = async (sessionId, params = {}) => {
  const response = await apiClient.get(`/chat/${sessionId}/mentions`, {
    params
  });
  return response.data;
};

export const getWhiteboardState = async (sessionId) => {
  const response = await apiClient.get(`/chat/${sessionId}/whiteboard-state`);
  return response.data;
};

export const uploadChatFile = async (sessionId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);

  const response = await apiClient.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};
