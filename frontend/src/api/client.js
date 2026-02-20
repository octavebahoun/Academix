import axios from 'axios';

// URLs de base pour les différentes API
// Utilise les variables d'environnement si disponibles, sinon utilise les valeurs par défaut de production

// URL API Node.js (Chat, Messages, Notifications)
const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || 'https://team-d-excellence-hackbyifri-2026.onrender.com/api';

// URL API Laravel (Authentification, Utilisateurs, Cours)
const LARAVEL_API_URL = import.meta.env.VITE_LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';

// URL API Python (IA: Résumés, Quiz, Exercices, Images)
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://127.0.0.1:5000/api/v1';

/**
 * Client pour l'API Node.js (Chat, Notifications, etc.)
 */
const nodeApiClient = axios.create({
    baseURL: NODE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

/**
 * Client pour l'API Laravel (Core, Authentification, etc.)
 */
const laravelApiClient = axios.create({
    baseURL: LARAVEL_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

/**
 * Client pour l'API Python (Intelligence Artificielle)
 */
const pythonApiClient = axios.create({
    baseURL: PYTHON_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fonction pour configurer les intercepteurs sur un client donné
const setupInterceptors = (client) => {
    // Intercepteur pour ajouter le token d'authentification
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Intercepteur pour gérer les erreurs
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Redirection vers la page de connexion si non authentifié
                // Attention : ne pas rediriger si on est déjà sur login pour éviter une boucle
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
};

// Configurer les intercepteurs pour tous les clients
setupInterceptors(nodeApiClient);
setupInterceptors(laravelApiClient);
setupInterceptors(pythonApiClient);

// Export par défaut (Historique: Node)
export default nodeApiClient;

// Exports nommés pour une utilisation explicite
export { nodeApiClient, laravelApiClient, pythonApiClient };
