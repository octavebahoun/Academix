import { laravelApiClient } from '../api/client';

/**
 * Services pour les endpoints /api/v1/departement/*
 * (Chef de département / Admin propriétaire du département)
 */
export const departementService = {
    // Matières (CRUD)
    getMatieres: async (params = {}) => {
        const response = await laravelApiClient.get('/departement/matieres', { params });
        return response.data;
    },

    getMatiere: async (id) => {
        const response = await laravelApiClient.get(`/departement/matieres/${id}`);
        return response.data;
    },

    createMatiere: async (data) => {
        const response = await laravelApiClient.post('/departement/matieres', data);
        return response.data;
    },

    updateMatiere: async (id, data) => {
        const response = await laravelApiClient.put(`/departement/matieres/${id}`, data);
        return response.data;
    },

    deleteMatiere: async (id) => {
        const response = await laravelApiClient.delete(`/departement/matieres/${id}`);
        return response.data;
    },

    // Filières
    getFilieres: async (params = {}) => {
        const response = await laravelApiClient.get('/departement/filieres', { params });
        return response.data;
    },

    getFiliere: async (id) => {
        const response = await laravelApiClient.get(`/departement/filieres/${id}`);
        return response.data;
    },

    createFiliere: async (data) => {
        const response = await laravelApiClient.post('/departement/filieres', data);
        return response.data;
    },

    updateFiliere: async (id, data) => {
        const response = await laravelApiClient.put(`/departement/filieres/${id}`, data);
        return response.data;
    },

    deleteFiliere: async (id) => {
        const response = await laravelApiClient.delete(`/departement/filieres/${id}`);
        return response.data;
    },

    // Affectations matières ↔ filière
    assignMatiereToFiliere: async (filiereId, payload) => {
        const response = await laravelApiClient.post(`/departement/filieres/${filiereId}/matieres`, payload);
        return response.data;
    },

    removeMatiereFromFiliere: async (filiereId, matiereId) => {
        const response = await laravelApiClient.delete(`/departement/filieres/${filiereId}/matieres/${matiereId}`);
        return response.data;
    },

    // Filière - infos annexes
    getFiliereEtudiants: async (filiereId, params = {}) => {
        const response = await laravelApiClient.get(`/departement/filieres/${filiereId}/etudiants`, { params });
        return response.data;
    },

    getFiliereMatieres: async (filiereId) => {
        const response = await laravelApiClient.get(`/departement/filieres/${filiereId}/matieres`);
        return response.data;
    },

    getFiliereStats: async (filiereId) => {
        const response = await laravelApiClient.get(`/departement/filieres/${filiereId}/stats`);
        return response.data;
    },

    getFiliereEmploiTemps: async (filiereId, params = {}) => {
        const response = await laravelApiClient.get(`/departement/filieres/${filiereId}/emploi-temps`, { params });
        return response.data;
    },

    // Étudiants (liste département)
    getEtudiants: async (params = {}) => {
        const response = await laravelApiClient.get('/departement/etudiants', { params });
        return response.data;
    },

    // Imports (CSV)
    importEtudiants: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await laravelApiClient.post('/departement/import/etudiants', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    importNotes: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await laravelApiClient.post('/departement/import/notes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Notes (CRUD)
    getNotes: async (params = {}) => {
        const response = await laravelApiClient.get('/departement/notes', { params });
        return response.data;
    },

    getNote: async (id) => {
        const response = await laravelApiClient.get(`/departement/notes/${id}`);
        return response.data;
    },

    createNote: async (data) => {
        const response = await laravelApiClient.post('/departement/notes', data);
        return response.data;
    },

    updateNote: async (id, data) => {
        const response = await laravelApiClient.put(`/departement/notes/${id}`, data);
        return response.data;
    },

    deleteNote: async (id) => {
        const response = await laravelApiClient.delete(`/departement/notes/${id}`);
        return response.data;
    },

    // Emploi du temps (CRUD)
    getEmploiTemps: async (params = {}) => {
        const response = await laravelApiClient.get('/departement/emploi-temps', { params });
        return response.data;
    },

    getEmploiTempsItem: async (id) => {
        const response = await laravelApiClient.get(`/departement/emploi-temps/${id}`);
        return response.data;
    },

    createEmploiTemps: async (data) => {
        const response = await laravelApiClient.post('/departement/emploi-temps', data);
        return response.data;
    },

    updateEmploiTemps: async (id, data) => {
        const response = await laravelApiClient.put(`/departement/emploi-temps/${id}`, data);
        return response.data;
    },

    deleteEmploiTemps: async (id) => {
        const response = await laravelApiClient.delete(`/departement/emploi-temps/${id}`);
        return response.data;
    },

    // Dashboard
    getDashboard: async () => {
        const response = await laravelApiClient.get('/departement/dashboard');
        return response.data;
    }
};
