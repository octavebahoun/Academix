/**
 * @file ChatRoom.js
 * @description Modèle Mongoose représentant un salon de chat.
 * Chaque ChatRoom est lié à une session collaborative et contient
 * la liste des utilisateurs actifs, le statut d'activité et les timestamps.
 * Utilisé pour organiser les conversations par session d'étude.
 */

const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCollaborative',
    required: true,
    unique: true
  },
  room_name: {
    type: String,
    required: true
  },
  active_users: [{
    user_id: Number,
    nom: String,
    prenom: String,
    avatar_url: String,
    joined_at: Date
  }],
  last_activity: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'chat_rooms'
});

chatRoomSchema.index({ is_active: 1, last_activity: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
