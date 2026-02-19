/**
 * @file chatController.js
 * @description Contrôleur gérant la logique métier du chat de session.
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs/promises');
const Message = require('../models/Message');
const SessionParticipant = require('../models/SessionParticipant');
const SessionCollaborative = require('../models/SessionCollaborative');
const OnlineUser = require('../models/OnlineUser');
const logger = require('../utils/logger');

const toObjectId = (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

/**
 * GET /api/chat/:sessionId/messages
 */
exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const before = req.query.before || null;
    const objectId = toObjectId(sessionId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId invalide'
      });
    }

    const query = {
      session_id: objectId,
      is_deleted: false
    };

    if (before) {
      if (mongoose.Types.ObjectId.isValid(before)) {
        const cursorMessage = await Message.findById(before).select('createdAt').lean();
        if (cursorMessage?.createdAt) {
          query.createdAt = { $lt: cursorMessage.createdAt };
        }
      } else {
        const beforeDate = new Date(before);
        if (!Number.isNaN(beforeDate.getTime())) {
          query.createdAt = { $lt: beforeDate };
        }
      }
    }

    let dbQuery = Message.find(query).sort({ createdAt: -1 }).limit(limit + 1);
    if (page > 0 && !before) {
      dbQuery = dbQuery.skip((page - 1) * limit).limit(limit + 1);
    }

    const rawMessages = await dbQuery.lean();
    const hasMore = rawMessages.length > limit;
    const messages = hasMore ? rawMessages.slice(0, limit) : rawMessages;
    const orderedMessages = messages.reverse();
    const oldestMessage = messages[messages.length - 1];
    const nextCursor = hasMore && oldestMessage ? oldestMessage.createdAt.toISOString() : null;

    res.json({
      success: true,
      messages: orderedMessages,
      count: orderedMessages.length,
      pagination: {
        limit,
        page: page || 1,
        hasMore,
        nextCursor
      }
    });
  } catch (error) {
    logger.error('Error fetching session messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

/**
 * GET /api/chat/:sessionId/participants
 */
exports.getParticipants = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const roleFilter = req.query.role;
    const objectId = toObjectId(sessionId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId invalide'
      });
    }

    const participantQuery = { session_id: objectId };
    if (roleFilter) {
      participantQuery.role = roleFilter;
    }

    const participants = await SessionParticipant.find(participantQuery).lean();
    const onlineUsers = await OnlineUser.find({
      status: 'online',
      current_session_id: objectId
    }).lean();
    const onlineSet = new Set(onlineUsers.map((user) => user.user_id));

    const payload = participants.map((participant) => ({
      userId: participant.user_id,
      statut: participant.statut,
      joined_at: participant.joined_at,
      left_at: participant.left_at,
      role: participant.role || 'participant',
      online: onlineSet.has(participant.user_id),
      user_info: participant.user_info
    }));

    res.json({
      success: true,
      participants: payload,
      count: payload.length
    });
  } catch (error) {
    logger.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants',
      error: error.message
    });
  }
};

/**
 * GET /api/chat/:sessionId/mentions
 */
exports.getMentionSuggestions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const q = (req.query.q || '').trim();
    const role = req.query.role;
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);
    const objectId = toObjectId(sessionId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId invalide'
      });
    }

    const participantQuery = { session_id: objectId };
    if (role) {
      participantQuery.role = role;
    }

    const participants = await SessionParticipant.find(participantQuery).lean();
    const searchTerm = q.toLowerCase();

    const suggestions = participants
      .filter((participant) => {
        if (!searchTerm) return true;
        const nom = participant.user_info?.nom || '';
        const prenom = participant.user_info?.prenom || '';
        const full = `${prenom} ${nom}`.trim();
        return (
          nom.toLowerCase().includes(searchTerm)
          || prenom.toLowerCase().includes(searchTerm)
          || full.toLowerCase().includes(searchTerm)
        );
      })
      .slice(0, limit)
      .map((participant) => ({
        userId: participant.user_id,
        role: participant.role || 'participant',
        display: `${participant.user_info?.prenom || ''} ${participant.user_info?.nom || ''}`.trim(),
        nom: participant.user_info?.nom || '',
        prenom: participant.user_info?.prenom || ''
      }));

    return res.json({
      success: true,
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    logger.error('Error fetching mention suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des suggestions',
      error: error.message
    });
  }
};

/**
 * GET /api/chat/:sessionId/whiteboard-state
 */
exports.getWhiteboardState = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const objectId = toObjectId(sessionId);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId invalide'
      });
    }

    const session = await SessionCollaborative.findById(objectId)
      .select('whiteboard_state whiteboard_updated_at')
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session introuvable'
      });
    }

    return res.json({
      success: true,
      state: session.whiteboard_state || [],
      updatedAt: session.whiteboard_updated_at || null
    });
  } catch (error) {
    logger.error('Error fetching whiteboard state:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du whiteboard',
      error: error.message
    });
  }
};

/**
 * POST /api/chat/upload
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const sessionObjectId = toObjectId(req.body.sessionId);
    if (!sessionObjectId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId invalide'
      });
    }

    const uploadsRoot = process.env.UPLOAD_BASE_PATH || path.join(process.cwd(), 'uploads', 'chat');
    await fs.mkdir(uploadsRoot, { recursive: true });

    const publicHost = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${publicHost}/uploads/chat/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        mime: req.file.mimetype,
        size: req.file.size,
        extension: path.extname(req.file.originalname || '').replace('.', ''),
        storage: 'local'
      },
      message: 'Fichier uploadé avec succès'
    });
  } catch (error) {
    logger.error('Error uploading chat file:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message
    });
  }
};
