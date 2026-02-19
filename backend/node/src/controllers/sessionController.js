/**
 * @file sessionController.js
 * @description Gestion des sessions collaboratives (REST) côté Node.
 */

const SessionCollaborative = require('../models/SessionCollaborative');
const SessionParticipant = require('../models/SessionParticipant');
const ChatRoom = require('../models/ChatRoom');
const logger = require('../utils/logger');

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatSessionResponse = (session, participantCount = 0) => ({
  id: session._id,
  titre: session.titre,
  description: session.description,
  date_debut: session.date_debut,
  date_fin: session.date_fin,
  duree_minutes: session.duree_minutes,
  format: session.format,
  max_participants: session.nb_max_participants,
  participants_actuels: participantCount,
  statut: session.statut,
  createur: {
    id: session.organisateur_id,
    nom: session.organisateur_info?.nom,
    prenom: session.organisateur_info?.prenom,
    avatar_url: session.organisateur_info?.avatar_url
  },
  matiere: session.matiere_id
    ? { id: session.matiere_id, nom: session.matiere_nom }
    : null
});

/**
 * GET /api/sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const { format, matiere_id: matiereId, statut, scope, q } = req.query;
    const query = {};

    if (format) {
      query.format = format;
    }

    const matiereValue = normalizeNumber(matiereId);
    if (matiereValue !== null) {
      query.matiere_id = matiereValue;
    }

    if (statut) {
      query.statut = statut;
    }

    if (q) {
      query.titre = { $regex: q, $options: 'i' };
    }

    if (scope === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.date_debut = { $gte: start, $lte: end };
    }

    if (scope === 'upcoming') {
      query.date_debut = { $gte: new Date() };
    }

    const sessions = await SessionCollaborative.find(query).sort({ date_debut: 1 }).lean();
    const sessionIds = sessions.map((session) => session._id);

    const participantCounts = await SessionParticipant.aggregate([
      { $match: { session_id: { $in: sessionIds } } },
      { $group: { _id: '$session_id', count: { $sum: 1 } } }
    ]);

    const countMap = new Map(
      participantCounts.map((item) => [item._id.toString(), item.count])
    );

    const response = sessions.map((session) =>
      formatSessionResponse(session, countMap.get(session._id.toString()) || 0)
    );

    res.json({ success: true, sessions: response });
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions',
      error: error.message
    });
  }
};

/**
 * POST /api/sessions
 */
exports.createSession = async (req, res) => {
  try {
    const {
      titre,
      description,
      date_debut,
      duree_minutes = 90,
      format = 'visio',
      max_participants = 10,
      matiere_id = null,
      matiere_nom = null,
      lien_visio = null,
      lieu = null
    } = req.body;

    if (!titre || !date_debut) {
      return res.status(400).json({
        success: false,
        message: 'titre et date_debut sont requis'
      });
    }

    const sessionStart = new Date(date_debut);
    const sessionEnd = new Date(sessionStart.getTime() + Number(duree_minutes) * 60000);

    const session = new SessionCollaborative({
      organisateur_id: req.user.id,
      organisateur_info: {
        nom: req.user.nom,
        prenom: req.user.prenom,
        avatar_url: req.user.avatar_url
      },
      matiere_id: normalizeNumber(matiere_id),
      matiere_nom,
      titre,
      description,
      date_debut: sessionStart,
      date_fin: sessionEnd,
      duree_minutes: Number(duree_minutes),
      format,
      nb_max_participants: Number(max_participants),
      lien_visio,
      lieu,
      statut: 'planifiee'
    });

    session.room_id = `session_${session._id}`;
    await session.save();

    const chatRoom = new ChatRoom({
      session_id: session._id,
      room_name: titre,
      active_users: [],
      last_activity: new Date(),
      is_active: true
    });
    await chatRoom.save();

    await SessionParticipant.findOneAndUpdate(
      { session_id: session._id, user_id: req.user.id },
      {
        $set: {
          user_info: {
            nom: req.user.nom,
            prenom: req.user.prenom,
            avatar_url: req.user.avatar_url
          },
          role: 'moderateur',
          statut: 'present',
          joined_at: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      session: formatSessionResponse(session, 1)
    });
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session',
      error: error.message
    });
  }
};

/**
 * POST /api/sessions/:id/join
 */
exports.joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de session invalide'
      });
    }
    const session = await SessionCollaborative.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session introuvable'
      });
    }

    const participant = await SessionParticipant.findOneAndUpdate(
      { session_id: session._id, user_id: req.user.id },
      {
        $set: {
          user_info: {
            nom: req.user.nom,
            prenom: req.user.prenom,
            avatar_url: req.user.avatar_url
          },
          role: req.user.id === session.organisateur_id || req.body?.role === 'moderateur'
            ? 'moderateur'
            : 'participant',
          statut: 'present',
          joined_at: new Date(),
          left_at: null
        }
      },
      { upsert: true, new: true }
    );

    await ChatRoom.findOneAndUpdate(
      { session_id: session._id },
      { $set: { last_activity: new Date(), is_active: true } },
      { upsert: true }
    );

    const participantsCount = await SessionParticipant.countDocuments({
      session_id: session._id
    });

    res.json({
      success: true,
      message: 'Inscription confirmée',
      room_url: session.lien_visio || `session_${session._id}`,
      participants_count: participantsCount,
      participant
    });
  } catch (error) {
    logger.error('Error joining session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription à la session',
      error: error.message
    });
  }
};

/**
 * POST /api/sessions/:id/rate
 */
exports.rateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, commentaire } = req.body;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de session invalide'
      });
    }

    const participant = await SessionParticipant.findOneAndUpdate(
      { session_id: id, user_id: req.user.id },
      { $set: { note_donnee: note, commentaire } },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé pour cette session'
      });
    }

    res.json({
      success: true,
      message: 'Note enregistrée',
      participant
    });
  } catch (error) {
    logger.error('Error rating session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la notation de la session',
      error: error.message
    });
  }
};
