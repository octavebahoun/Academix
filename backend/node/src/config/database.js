/**
 * @file database.js
 * @description Configuration de la connexion à la base de données MongoDB.
 * Gère les paramètres de connexion (URI, options), la gestion des erreurs
 * de connexion et la reconnexion automatique pour le stockage des données
 * temps réel (messages, notifications, sessions collaboratives).
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('Connexion à la base de données réussie');
        connection.release();
    })
    .catch(err => {
        console.error('Erreur de connexion à la base de données:', err);
        process.exit(1);
    });

module.exports = pool;