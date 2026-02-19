/**
 * @file logger.js
 * @description Utilitaire de journalisation (logging) de l'application.
 * Configure et expose un logger centralisé pour enregistrer les événements,
 * erreurs et informations de débogage avec différents niveaux de sévérité
 * (info, warn, error, debug) et formatage horodaté.
 */

const winston = require('winston');
const path = require('path');

// Configuration des formats
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Format pour la console (plus lisible)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}] ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Créer le logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Console
        new winston.transports.Console({
            format: consoleFormat
        }),
        // Fichier pour les erreurs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Fichier pour tous les logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// En développement, logger plus de détails
if (process.env.NODE_ENV === 'development') {
    logger.level = 'debug';
}

module.exports = logger;
