/**
 * @file Message.js
 * @description Modèle Mongoose représentant un message dans le chat.
 * Stocke le contenu des messages échangés dans les salons de chat,
 * avec support pour différents types (texte, système, fichier, image),
 * l'édition, la suppression logique et les informations de l'expéditeur.
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat_room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCollaborative',
    required: true,
    index: true
  },
  user_id: {
    type: Number, // ID depuis MySQL
    required: true
  },
  user_info: {
    nom: String,
    prenom: String,
    avatar_url: String
  },
  type: {
    type: String,
    enum: ['text', 'system', 'file', 'image'],
    default: 'text'
  },
  contenu: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    default: null
  },
  file_meta: {
    name: String,
    mime: String,
    size: Number,
    extension: String,
    storage: {
      type: String,
      enum: ['local', 's3'],
      default: 'local'
    }
  },
  mentions: [{
    type: Number
  }],
  mentions_meta: [{
    user_id: Number,
    nom: String,
    prenom: String,
    role: String
  }],
  is_edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date,
    default: null
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  receiver: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// Index pour performance
messageSchema.index({ chat_room_id: 1, createdAt: -1 });
messageSchema.index({ session_id: 1, createdAt: -1 });
messageSchema.index({ user_id: 1 });
messageSchema.index({ session_id: 1, mentions: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
