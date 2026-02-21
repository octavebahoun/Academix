import { pythonApiClient } from '../api/client';

export const aiService = {
    // RAG Chat (Non demandé pour le moment mais présent dans Python)
    chat: async (question) => {
        const response = await pythonApiClient.post('/chat', { question });
        return response.data;
    },

    // Résumés
    generateSummary: async (formData) => {
        //  formData est utilisé ici car on envoie un fichier
        const response = await pythonApiClient.post('/summary/generate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getSummary: async (id) => {
        const response = await pythonApiClient.get(`/summary/${id}`);
        return response.data;
    },

    // Quiz
    generateQuiz: async (formData) => {
        const response = await pythonApiClient.post('/quiz/generate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    correctQuiz: async (payload) => {
        const response = await pythonApiClient.post('/quiz/correct', payload);
        return response.data;
    },

    // Exercices
    generateExercises: async (formData) => {
        const response = await pythonApiClient.post('/exercises/generate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Génération d'image
    generateImage: async (prompt) => {
        const response = await pythonApiClient.post(`/image/generate?prompt=${encodeURIComponent(prompt)}`);
        return response.data;
    }
};
