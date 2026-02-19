/**
 * @file Notification.js
 * @description Modèle Mongoose représentant une notification utilisateur.
 * Gère les différents types de notifications (info, rappel, alerte, succès,
 * badge, session, message) avec support pour les données additionnelles,
 * le statut de lecture et l'expiration automatique via TTL index.
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: Number, // ID depuis MySQL
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['info', 'rappel', 'alerte', 'succes', 'badge', 'session', 'message', 'mention'],
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  action_url: {
    type: String,
    default: null
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Données additionnelles flexibles
    default: {}
  },
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: {
    type: Date,
    default: null
  },
  expires_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Index pour performance
notificationSchema.index({ user_id: 1, is_read: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Notification', notificationSchema);
