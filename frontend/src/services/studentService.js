import { laravelApiClient } from '../api/client';

/**
 * Services pour les endpoints /api/v1/student/*
 */
export const studentService = {
    getProfil: async () => {
        const response = await laravelApiClient.get('/student/profil');
        return response.data;
    },

    getMoyennes: async () => {
        const response = await laravelApiClient.get('/student/moyennes');
        return response.data;
    },

    getNotes: async (params = {}) => {
        const response = await laravelApiClient.get('/student/notes', { params });
        return response.data;
    },

    getEmploiTemps: async (params = {}) => {
        const response = await laravelApiClient.get('/student/emploi-temps', { params });
        return response.data;
    },

    // Tâches
    getTaches: async (params = {}) => {
        const response = await laravelApiClient.get('/student/taches', { params });
        return response.data;
    },

    createTache: async (data) => {
        const response = await laravelApiClient.post('/student/taches', data);
        return response.data;
    },

    getTache: async (id) => {
        const response = await laravelApiClient.get(`/student/taches/${id}`);
        return response.data;
    },

    updateTache: async (id, data) => {
        const response = await laravelApiClient.put(`/student/taches/${id}`, data);
        return response.data;
    },

    deleteTache: async (id) => {
        const response = await laravelApiClient.delete(`/student/taches/${id}`);
        return response.data;
    },

    completeTache: async (id) => {
        const response = await laravelApiClient.patch(`/student/taches/${id}/complete`);
        return response.data;
    },

    // Alertes
    getAlertes: async (params = {}) => {
        const response = await laravelApiClient.get('/student/alertes', { params });
        return response.data;
    },

    markAlerteAsRead: async (id) => {
        const response = await laravelApiClient.patch(`/student/alertes/${id}/read`);
        return response.data;
    },

    // Profil — champs supportés : telephone, photo (url), objectif_moyenne, style_apprentissage
    updateProfil: async (data) => {
        const response = await laravelApiClient.put('/student/profil', data);
        return response.data;
    },
};
