/**
 * @file auth.js
 * @description Middleware d'authentification Node.js branché sur Laravel Sanctum.
 *
 * Fonctionnement :
 *   1. Le client envoie : Authorization: Bearer {id}|{plainToken}
 *   2. On extrait l'ID et le plainToken
 *   3. On cherche la ligne dans personal_access_tokens par ID
 *   4. On compare SHA-256(plainToken) avec la colonne `token`
 *   5. On retrouve l'utilisateur selon tokenable_type/tokenable_id
 *   6. On attache user + role à req.user
 */

const crypto = require('crypto');
const mysql  = require('mysql2/promise');

// Pool MySQL partagé avec Laravel (même base de données)
let pool;
function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host    : process.env.DB_HOST     || '127.0.0.1',
            port    : parseInt(process.env.DB_PORT || '3306'),
            user    : process.env.DB_USER     || process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME     || process.env.DB_DATABASE || 'academix',
            waitForConnections: true,
            connectionLimit   : 5,
        });
    }
    return pool;
}

/**
 * Résoudre tokenable_type → table SQL + champs retournés
 */
const MODEL_MAP = {
    'App\\Models\\Admin': {
        table : 'super_admins',
        role  : 'super_admin',
        fields: 'id, nom, prenom, email, photo, is_active',
    },
    'App\\Models\\ChefDepartement': {
        table : 'chefs_departement',
        role  : 'chef_departement',
        fields: 'id, nom, prenom, email, photo, departement_id, is_active',
    },
    'App\\Models\\User': {
        table : 'users',
        role  : 'student',
        fields: 'id, nom, prenom, email, avatar_url, filiere_id, niveau',
    },
};

/**
 * Middleware principal — vérifie le token Sanctum via MySQL
 */
module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Token d'authentification manquant. Envoyez : Authorization: Bearer {token}"
            });
        }

        const rawToken = authHeader.slice(7); // supprimer "Bearer "

        // Format Sanctum : "{id}|{plainTextToken}"
        const pipeIndex = rawToken.indexOf('|');
        if (pipeIndex === -1) {
            return res.status(401).json({
                success: false,
                message: 'Format de token invalide. Format attendu : {id}|{token}'
            });
        }

        const tokenId  = rawToken.slice(0, pipeIndex);
        const rawHash  = rawToken.slice(pipeIndex + 1);

        // Sanctum stocke SHA-256 du plainToken dans la colonne `token`
        const hashedToken = crypto.createHash('sha256').update(rawHash).digest('hex');

        const db = getPool();

        // 1. Chercher le token dans personal_access_tokens
        const [rows] = await db.query(
            `SELECT id, tokenable_type, tokenable_id, expires_at
             FROM personal_access_tokens
             WHERE id = ? AND token = ?`,
            [tokenId, hashedToken]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou révoqué'
            });
        }

        const accessToken = rows[0];

        // 2. Vérifier l'expiration (si expires_at est défini)
        if (accessToken.expires_at && new Date(accessToken.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Token expiré. Veuillez vous reconnecter.'
            });
        }

        // 3. Retrouver le modèle (Admin, ChefDepartement, ou User)
        const modelConfig = MODEL_MAP[accessToken.tokenable_type];
        if (!modelConfig) {
            return res.status(401).json({
                success: false,
                message: `Type d'utilisateur non reconnu : ${accessToken.tokenable_type}`
            });
        }

        // 4. Récupérer les données de l'utilisateur dans sa table
        const [userRows] = await db.query(
            `SELECT ${modelConfig.fields} FROM ${modelConfig.table} WHERE id = ?`,
            [accessToken.tokenable_id]
        );

        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur associé au token introuvable'
            });
        }

        const user = userRows[0];

        // 5. Vérifier que le compte est actif (si la colonne existe)
        if ('is_active' in user && !user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Compte désactivé. Contactez un administrateur.'
            });
        }

        // 6. Attacher l'utilisateur + son rôle à la requête
        req.user = {
            ...user,
            role      : modelConfig.role,
            token_id  : accessToken.id,          // utile pour révoquer le token
            token_type: accessToken.tokenable_type,
        };

        // Mettre à jour last_used_at en arrière-plan (optionnel)
        db.query(
            'UPDATE personal_access_tokens SET last_used_at = NOW() WHERE id = ?',
            [accessToken.id]
        ).catch(() => {}); // silencieux

        next();

    } catch (error) {
        console.error('[Auth Middleware] Erreur:', error.message);
        return res.status(500).json({
            success : false,
            message : 'Erreur interne lors de la vérification du token',
            error   : process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Middleware Socket.io — même logique mais pour les connexions WebSocket.
 * Utilisation :
 *   const { socketAuth } = require('./middleware/auth');
 *   io.use(socketAuth);
 */
module.exports.socketAuth = async (socket, next) => {
    try {
        // Le token peut venir de socket.handshake.auth.token ou des headers
        const rawToken =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!rawToken) {
            return next(new Error('Token manquant pour la connexion WebSocket'));
        }

        const pipeIndex = rawToken.indexOf('|');
        if (pipeIndex === -1) {
            return next(new Error('Format de token WebSocket invalide'));
        }

        const tokenId    = rawToken.slice(0, pipeIndex);
        const rawHash    = rawToken.slice(pipeIndex + 1);
        const hashedToken = crypto.createHash('sha256').update(rawHash).digest('hex');

        const db = getPool();

        const [rows] = await db.query(
            `SELECT tokenable_type, tokenable_id FROM personal_access_tokens
             WHERE id = ? AND token = ? AND (expires_at IS NULL OR expires_at > NOW())`,
            [tokenId, hashedToken]
        );

        if (rows.length === 0) {
            return next(new Error('Token WebSocket invalide ou expiré'));
        }

        const { tokenable_type, tokenable_id } = rows[0];
        const modelConfig = MODEL_MAP[tokenable_type];

        if (!modelConfig) {
            return next(new Error(`Type utilisateur non reconnu : ${tokenable_type}`));
        }

        const [userRows] = await db.query(
            `SELECT ${modelConfig.fields} FROM ${modelConfig.table} WHERE id = ?`,
            [tokenable_id]
        );

        if (userRows.length === 0) {
            return next(new Error('Utilisateur WebSocket introuvable'));
        }

        // Attacher l'utilisateur au socket
        socket.user = { ...userRows[0], role: modelConfig.role };
        next();

    } catch (err) {
        console.error('[Socket Auth] Erreur:', err.message);
        next(new Error('Erreur interne WebSocket auth'));
    }
};
