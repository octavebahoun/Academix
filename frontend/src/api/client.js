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
});

// Fonction pour configurer les intercepteurs sur un client donné
const setupInterceptors = (client) => {
    // Intercepteur pour ajouter le token d'authentification
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                if (config.headers && typeof config.headers.set === 'function') {
                    config.headers.set('Authorization', `Bearer ${token}`);
                } else {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
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
            // Gestion de l'expiration du token (401)
            if (error.response?.status === 401) {
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }

            // Formater le message d'erreur pour l'utilisateur
            if (error.response?.data) {
                const originalMessage = error.response.data.message || error.response.data.error || "";

                // Détection des erreurs de base de données ou de services externes (Google Calendar, etc.)
                const isDatabaseError = /sql|database|db_|connection|query|mysql|pdo/i.test(originalMessage);
                const isExternalServiceError = /google|calendar|oauth|provider|api_key/i.test(originalMessage);
                const isServerError = error.response.status >= 500;

                if (isDatabaseError || isExternalServiceError || isServerError) {
                    const friendlyMessage = isExternalServiceError
                        ? "Désolé, une erreur est survenue lors de la communication avec un service externe (Google Calendar). Nos équipes travaillent à la résolution."
                        : "Une erreur technique est survenue sur nos serveurs. Veuillez réessayer dans quelques instants.";

                    // On remplace le message pour que les composants affichent le message formaté
                    if (error.response.data.message) error.response.data.message = friendlyMessage;
                    if (error.response.data.error) error.response.data.error = friendlyMessage;
                    if (!error.response.data.message && !error.response.data.error) error.response.data.message = friendlyMessage;
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

// Export par défaut 
export default nodeApiClient;

export { nodeApiClient, laravelApiClient, pythonApiClient, PYTHON_API_URL };
