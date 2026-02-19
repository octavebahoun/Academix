/**
 * @file PrivateMessage.js
 * @description Modèle Mongoose pour les messages privés entre utilisateurs.
 * Gère la persistance des conversations one-to-one avec historique,
 * statut de lecture et métadonnées utilisateur.
 */

const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
  sender: {
    type: Number, // ID depuis MySQL
    required: true,
    index: true
  },
  receiver: {
    type: Number, // ID depuis MySQL
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  read_at: {
    type: Date,
    default: null
  },
  // Informations dénormalisées pour performance
  sender_info: {
    nom: String,
    prenom: String,
    avatar_url: String
  },
  receiver_info: {
    nom: String,
    prenom: String,
    avatar_url: String
  },
  // Type de message (texte, image, fichier)
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  file_url: {
    type: String,
    default: null
  },
  // Soft delete
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // createdAt, updatedAt
  collection: 'private_messages'
});

// Index composé pour récupérer les conversations entre deux utilisateurs
privateMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
privateMessageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

// Index pour récupérer les messages non lus
privateMessageSchema.index({ receiver: 1, read: 1 });

// Méthode statique pour récupérer une conversation
privateMessageSchema.statics.getConversation = async function(userId1, userId2, limit = 50) {
  return this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ],
    is_deleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Méthode statique pour marquer les messages comme lus
privateMessageSchema.statics.markAsRead = async function(senderId, receiverId) {
  return this.updateMany(
    {
      sender: senderId,
      receiver: receiverId,
      read: false
    },
    {
      read: true,
      read_at: new Date()
    }
  );
};

module.exports = mongoose.model('PrivateMessage', privateMessageSchema);
