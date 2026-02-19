/**
 * @file auth.js
 * @description Middleware d'authentification pour les requêtes HTTP et WebSocket.
 * Vérifie la validité des tokens JWT, extrait les informations utilisateur
 * et protège les routes/événements nécessitant une authentification.
 * Fait le pont avec le système d'auth du backend Laravel.
 */

const jwt = require('jsonwebtoken');


module.exports = async (req, res, next) => {
    try {
        // Mode développement j'autorise sans token pour les tests en attente de mourchid
        if (process.env.NODE_ENV === 'development') {
            // Utilisateur de test par défaut
            req.user = {
                id: 1,
                nom: 'Dupont',
                prenom: 'Jean',
                email: 'jean.dupont@test.com',
                avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean'
            };
            return next();
        }

        // Mode production : vérifier le token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Vérifier le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');

        // Attacher les informations utilisateur à la requête
        req.user = {
            id: decoded.id || decoded.user_id,
            nom: decoded.nom,
            prenom: decoded.prenom,
            email: decoded.email,
            avatar_url: decoded.avatar_url
        };

        next();
    } catch (error) {
        console.error('Auth error:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
