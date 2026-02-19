/**
 * @file SessionEvent.js
 * @description Modèle Mongoose représentant un événement survenu dans une session collaborative.
 * Enregistre l'historique des actions des utilisateurs au sein d'une session :
 * rejoindre, quitter, être exclu, être promu ou être mis en sourdine.
 * Permet de tracer l'activité et l'historique de chaque session.
 */

const mongoose = require('mongoose');

const sessionEventSchema = new mongoose.Schema({
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
    prenom: String
  },
  event_type: {
    type: String,
    enum: ['joined', 'left', 'kicked', 'promoted', 'muted'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'session_events'
});

// Index pour historique
sessionEventSchema.index({ session_id: 1, createdAt: -1 });
sessionEventSchema.index({ user_id: 1 });

module.exports = mongoose.model('SessionEvent', sessionEventSchema);
