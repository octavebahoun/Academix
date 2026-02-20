/**
 * @file SessionCollaborative.js
 * @description Modèle Mongoose représentant une session d'étude collaborative.
 * Définit les propriétés d'une session : organisateur, matière, format
 * (en ligne/présentiel), niveau requis, nombre max de participants, statut
 * (planifiée, en cours, terminée, annulée) et lien vers la room Socket.io.
 */

const mongoose = require('mongoose');

const sessionCollaborativeSchema = new mongoose.Schema({
  organisateur_id: {
    type: Number, // ID depuis MySQL
    required: true,
    index: true
  },
  matiere_id: {
    type: Number, // ID depuis MySQL
    default: null
  },
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  duree_minutes: {
    type: Number,
    default: 90
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    default: null
  },
  format: {
    type: String,
    enum: ['visio', 'presentiel', 'chat', 'en_ligne'],
    default: 'visio'
  },
  lien_visio: {
    type: String,
    default: null
  },
  lieu: {
    type: String,
    default: null
  },
  nb_max_participants: {
    type: Number,
    default: 10
  },
  organisateur_info: {
    nom: String,
    prenom: String,
    avatar_url: String
  },
  matiere_nom: {
    type: String,
    default: null
  },
  niveau_requis: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance'],
    default: 'intermediaire'
  },
  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'planifiee'
  },
  room_id: {
    type: String, // ID Socket.io room
    unique: true
  },
  whiteboard_state: [{
    action: {
      type: String,
      enum: ['draw', 'erase', 'shape', 'text', 'clear'],
      default: 'draw'
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    user_id: {
      type: Number,
      default: null
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  whiteboard_updated_at: {
    type: Date,
    default: null
  },
  code_content: {
    type: String,
    default: ""
  },
  code_language: {
    type: String,
    default: "web"
  },
  whiteboard_text: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  collection: 'sessions_collaboratives'
});

// Index pour recherche
sessionCollaborativeSchema.index({ date_debut: 1, statut: 1 });
sessionCollaborativeSchema.index({ matiere_id: 1 });

module.exports = mongoose.model('SessionCollaborative', sessionCollaborativeSchema);
