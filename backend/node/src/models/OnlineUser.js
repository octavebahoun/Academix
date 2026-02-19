/**
 * @file OnlineUser.js
 * @description Modèle Mongoose représentant un utilisateur actuellement connecté.
 * Suit la présence en temps réel des utilisateurs (online, away, busy),
 * associe chaque utilisateur à son socket_id et à sa session en cours.
 * Inclut un TTL de 5 minutes pour nettoyage automatique des utilisateurs inactifs.
 */

const mongoose = require('mongoose');

const onlineUserSchema = new mongoose.Schema({
  user_id: {
    type: Number, // ID depuis MySQL
    required: true,
    unique: true
  },
  user_info: {
    nom: String,
    prenom: String,
    avatar_url: String
  },
  socket_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'away', 'busy'],
    default: 'online'
  },
  current_session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCollaborative',
    default: null
  },
  last_activity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'online_users'
});

// Index
onlineUserSchema.index({ socket_id: 1 });
onlineUserSchema.index({ status: 1 });
onlineUserSchema.index({ last_activity: -1 });

// TTL: Suppression auto après 5 min d'inactivité
onlineUserSchema.index({ last_activity: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('OnlineUser', onlineUserSchema);
