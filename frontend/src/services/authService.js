import { laravelApiClient } from '../api/client';

export const authService = {
    // --- ADMIN ---
    adminLogin: async (credentials) => {
        const response = await laravelApiClient.post('/auth/admin/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.admin));
            localStorage.setItem('role', 'super_admin');
        }
        return response.data;
    },

    adminRegister: async (data) => {
        const response = await laravelApiClient.post('/auth/admin/register', data);
        return response.data;
    },

    // --- CHEF ---
    chefLogin: async (credentials) => {
        const response = await laravelApiClient.post('/auth/chef/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.chef));
            localStorage.setItem('role', 'chef_departement');
        }
        return response.data;
    },

    // --- STUDENT ---
    studentLogin: async (credentials) => {
        const response = await laravelApiClient.post('/auth/student/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', 'student');
        }
        return response.data;
    },

    studentRegister: async (data) => {
        const response = await laravelApiClient.post('/auth/student/register', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', 'student');
        }
        return response.data;
    },

    logout: async () => {
        const role = localStorage.getItem('role');
        const endpoint = role === 'super_admin' ? '/auth/admin/logout'
            : role === 'chef_departement' ? '/auth/chef/logout'
                : '/auth/student/logout';

        try {
            await laravelApiClient.post(endpoint);
        } catch (e) {
            console.error('Logout error on server', e);
        }
        localStorage.clear();
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getRole: () => {
        return localStorage.getItem('role');
    }
};
