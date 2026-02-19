/**
 * @file SessionParticipant.js
 * @description Modèle Mongoose représentant un participant à une session collaborative.
 * Gère l'inscription et la présence des utilisateurs dans les sessions,
 * avec suivi des horaires d'arrivée/départ, du statut (inscrit, présent, absent)
 * et du système de notation/commentaire post-session.
 */

const mongoose = require('mongoose');

const sessionParticipantSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCollaborative',
    required: true
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
  statut: {
    type: String,
    enum: ['inscrit', 'present', 'absent'],
    default: 'inscrit'
  },
  role: {
    type: String,
    enum: ['participant', 'moderateur'],
    default: 'participant',
    index: true
  },
  joined_at: {
    type: Date,
    default: null
  },
  left_at: {
    type: Date,
    default: null
  },
  note_donnee: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  commentaire: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'session_participants'
});

// Index composé pour éviter doublons
sessionParticipantSchema.index({ session_id: 1, user_id: 1 }, { unique: true });
sessionParticipantSchema.index({ session_id: 1, role: 1 });

module.exports = mongoose.model('SessionParticipant', sessionParticipantSchema);
