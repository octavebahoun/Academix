import { laravelApiClient } from '../api/client';

export const adminService = {
    // Départements
    getDepartements: async () => {
        const response = await laravelApiClient.get('/admin/departements');
        return response.data;
    },

    createDepartement: async (data) => {
        const response = await laravelApiClient.post('/admin/departements', data);
        return response.data;
    },

    updateDepartement: async (id, data) => {
        const response = await laravelApiClient.put(`/admin/departements/${id}`, data);
        return response.data;
    },

    deleteDepartement: async (id) => {
        const response = await laravelApiClient.delete(`/admin/departements/${id}`);
        return response.data;
    },

    // Chefs de Département
    getChefs: async () => {
        const response = await laravelApiClient.get('/admin/chefs-departement');
        return response.data;
    },

    createChef: async (data) => {
        const response = await laravelApiClient.post('/admin/chefs-departement', data);
        return response.data;
    },

    updateChef: async (id, data) => {
        const response = await laravelApiClient.put(`/admin/chefs-departement/${id}`, data);
        return response.data;
    },

    deleteChef: async (id) => {
        const response = await laravelApiClient.delete(`/admin/chefs-departement/${id}`);
        return response.data;
    },

    toggleChefStatus: async (id) => {
        const response = await laravelApiClient.post(`/admin/chefs-departement/${id}/toggle`);
        return response.data;
    }
};
