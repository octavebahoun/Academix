/**
 * @file socketService.js
 * @description Service principal de gestion des événements WebSocket en temps réel.
 * Gère le chat des sessions collaboratives, la présence et les notifications.
 */

const mongoose = require('mongoose');
const ChatRoom = require('../models/ChatRoom');
const SessionCollaborative = require('../models/SessionCollaborative');
const SessionParticipant = require('../models/SessionParticipant');
const SessionEvent = require('../models/SessionEvent');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const OnlineUser = require('../models/OnlineUser');
const logger = require('../utils/logger');

const {
  KAVT_USER_ID,
  KAVT_MODEL,
  KAVT_CONTEXT_LIMIT,
  KAVT_MAX_QUESTION_CHARS,
  isKavtMentioned,
  extractKavtQuestion,
  createRateLimiter,
  buildKavtPromptMessages,
  sseStreamChat
} = require('./kavtService');

const MAX_WHITEBOARD_ACTIONS = Number(process.env.WHITEBOARD_MAX_ACTIONS || 2000);
const mentionTokenRegex = /@([\wÀ-ÿ.-]{2,50})/g;
const moderatorAliases = new Set(['mod', 'modo', 'moderateur', 'moderateurs', 'moderator', 'admins']);

const KAVT_ENABLED = process.env.KAVT_ENABLED !== 'false';
const kavtRateLimiter = createRateLimiter();

const safeUserLabel = (userInfo) => {
  const prenom = (userInfo?.prenom || '').toString().trim();
  const nom = (userInfo?.nom || '').toString().trim();
  const full = `${prenom} ${nom}`.trim();
  return full || nom || prenom || 'Participant';
};

const buildKavtUserInfo = () => ({
  nom: 'KAVT',
  prenom: '',
  avatar_url: null
});

const findRecentMessagesForKavt = async (sessionObjectId) => {
  const limit = Math.max(1, Math.min(50, Number(KAVT_CONTEXT_LIMIT || 20)));
  const docs = await Message.find({
    session_id: sessionObjectId,
    is_deleted: { $ne: true }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.reverse();
};

const streamKavtAnswer = async ({
  io,
  sessionId,
  sessionObjectId,
  chatRoomId,
  askerUserInfo,
  question
}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY manquant');
  }

  const assistantMessage = await Message.create({
    chat_room_id: chatRoomId,
    session_id: sessionObjectId,
    user_id: KAVT_USER_ID,
    user_info: buildKavtUserInfo(),
    type: 'text',
    contenu: '…',
    mentions: [],
    mentions_meta: []
  });

  io.to(sessionRoomName(sessionId)).emit('new-message', buildMessagePayload(assistantMessage));

  const contextMessages = await findRecentMessagesForKavt(sessionObjectId);
  const promptMessages = buildKavtPromptMessages({
    contextMessages,
    question,
    askerLabel: safeUserLabel(askerUserInfo)
  });

  let content = '';
  let lastEmitAt = 0;
  let lastDbUpdateAt = 0;

  const emitUpdate = ({ isFinal }) => {
    const now = Date.now();
    if (!isFinal && now - lastEmitAt < 80) return;
    lastEmitAt = now;
    io.to(sessionRoomName(sessionId)).emit('message-update', {
      _id: assistantMessage._id,
      contenu: content || '…',
      updatedAt: new Date().toISOString(),
      is_final: Boolean(isFinal)
    });
  };

  const persistUpdateIfNeeded = async ({ force }) => {
    const now = Date.now();
    if (!force && now - lastDbUpdateAt < 500) return;
    lastDbUpdateAt = now;
    await Message.updateOne(
      { _id: assistantMessage._id },
      { $set: { contenu: content || '…', updatedAt: new Date() } }
    );
  };

  try {
    for await (const delta of sseStreamChat({
      apiKey,
      model: KAVT_MODEL,
      messages: promptMessages
    })) {
      content += delta;
      emitUpdate({ isFinal: false });
      await persistUpdateIfNeeded({ force: false });
    }

    content = content.trim() || '…';
    await persistUpdateIfNeeded({ force: true });
    emitUpdate({ isFinal: true });
  } catch (error) {
    logger.error('KAVT streaming error:', error);
    content =
      "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans un instant.";
    await persistUpdateIfNeeded({ force: true });
    emitUpdate({ isFinal: true });
  }
};

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const toObjectId = (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
};

const sessionRoomName = (sessionId) => `session_${sessionId}`;

const buildMessagePayload = (message) => ({
  _id: message._id,
  session_id: message.session_id,
  user_id: message.user_id,
  user_info: message.user_info,
  type: message.type,
  contenu: message.contenu,
  file_url: message.file_url,
  file_meta: message.file_meta,
  mentions: message.mentions || [],
  mentions_meta: message.mentions_meta || [],
  createdAt: message.createdAt,
  updatedAt: message.updatedAt
});

const getParticipantsPayload = async (sessionObjectId) => {
  const participants = await SessionParticipant.find({ session_id: sessionObjectId }).lean();
  const onlineUsers = await OnlineUser.find({
    status: 'online',
    current_session_id: sessionObjectId
  }).lean();
  const onlineSet = new Set(onlineUsers.map((user) => user.user_id));

  return participants.map((participant) => ({
    userId: participant.user_id,
    statut: participant.statut,
    joined_at: participant.joined_at,
    left_at: participant.left_at,
    role: participant.role || 'participant',
    online: onlineSet.has(participant.user_id),
    user_info: participant.user_info
  }));
};

const getMentionParticipants = async (sessionObjectId, rawMessage, senderId) => {
  const tokens = [];
  const content = (rawMessage || '').toString();

  mentionTokenRegex.lastIndex = 0;
  let match = mentionTokenRegex.exec(content);
  while (match !== null) {
    tokens.push(normalizeText(match[1]));
    match = mentionTokenRegex.exec(content);
  }

  if (!tokens.length) {
    return [];
  }

  const participants = await SessionParticipant.find({ session_id: sessionObjectId }).lean();
  const selected = new Map();

  tokens.forEach((token) => {
    if (!token) return;

    if (moderatorAliases.has(token)) {
      participants
        .filter((participant) => participant.role === 'moderateur')
        .forEach((participant) => {
          if (participant.user_id !== senderId) {
            selected.set(participant.user_id, participant);
          }
        });
      return;
    }

    participants.forEach((participant) => {
      const nom = normalizeText(participant.user_info?.nom);
      const prenom = normalizeText(participant.user_info?.prenom);
      const fullName = `${prenom} ${nom}`.trim();

      if (
        participant.user_id !== senderId
        && (
          nom.includes(token)
          || prenom.includes(token)
          || fullName.includes(token)
        )
      ) {
        selected.set(participant.user_id, participant);
      }
    });
  });

  return Array.from(selected.values());
};

const emitMentionNotifications = async (io, mentionedParticipants, messageDoc, senderInfo) => {
  if (!mentionedParticipants.length) return;

  const notificationsToInsert = mentionedParticipants.map((participant) => ({
    user_id: participant.user_id,
    type: 'mention',
    titre: 'Vous avez été mentionné',
    message: `${senderInfo?.prenom || senderInfo?.nom || 'Un participant'} vous a mentionné dans le chat`,
    data: {
      session_id: messageDoc.session_id,
      message_id: messageDoc._id,
      from_user_id: messageDoc.user_id,
      from_user_info: senderInfo,
      extrait: (messageDoc.contenu || '').slice(0, 180)
    }
  }));

  const insertedNotifications = await Notification.insertMany(notificationsToInsert);
  insertedNotifications.forEach((notification) => {
    io.to(`user_${notification.user_id}`).emit('notification', notification);
  });
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('register-user', async (data) => {
      const userId = data?.userId;
      if (!userId) return;
      socket.join(`user_${userId}`);
    });

    socket.on('join-session', async (data) => {
      try {
        const { sessionId, userId, userInfo, role } = data || {};
        const sessionObjectId = toObjectId(sessionId);

        if (!sessionObjectId || !userId) {
          socket.emit('session-error', {
            error: 'sessionId et userId sont requis'
          });
          return;
        }

        const session = await SessionCollaborative.findById(sessionObjectId);
        if (!session) {
          socket.emit('session-error', {
            error: 'Session introuvable'
          });
          return;
        }

        const safeUserInfo = {
          nom: userInfo?.nom || 'Utilisateur',
          prenom: userInfo?.prenom || '',
          avatar_url: userInfo?.avatar_url || null
        };

        const resolvedRole = (
          role === 'moderateur' || Number(userId) === Number(session.organisateur_id)
        )
          ? 'moderateur'
          : 'participant';

        socket.user = { id: userId, role: resolvedRole, ...safeUserInfo };
        socket.currentSessionId = sessionId;

        await SessionParticipant.findOneAndUpdate(
          { session_id: sessionObjectId, user_id: userId },
          {
            $set: {
              user_info: safeUserInfo,
              role: resolvedRole,
              statut: 'present',
              joined_at: new Date(),
              left_at: null
            }
          },
          { upsert: true, new: true }
        );

        await OnlineUser.findOneAndUpdate(
          { user_id: userId },
          {
            $set: {
              user_info: safeUserInfo,
              socket_id: socket.id,
              status: 'online',
              current_session_id: sessionObjectId,
              last_activity: new Date()
            }
          },
          { upsert: true }
        );

        const chatRoom = await ChatRoom.findOneAndUpdate(
          { session_id: sessionObjectId },
          {
            $setOnInsert: {
              room_name: session.titre,
              session_id: sessionObjectId
            },
            $set: {
              last_activity: new Date(),
              is_active: true
            }
          },
          { upsert: true, new: true }
        );

        await ChatRoom.updateOne(
          { session_id: sessionObjectId },
          { $pull: { active_users: { user_id: userId } } }
        );
        await ChatRoom.updateOne(
          { session_id: sessionObjectId },
          {
            $push: {
              active_users: {
                user_id: userId,
                nom: safeUserInfo.nom,
                prenom: safeUserInfo.prenom,
                avatar_url: safeUserInfo.avatar_url,
                joined_at: new Date()
              }
            }
          }
        );

        await SessionEvent.create({
          session_id: sessionObjectId,
          user_id: userId,
          user_info: safeUserInfo,
          event_type: 'joined'
        });

        socket.join(sessionRoomName(sessionId));
        socket.emit('session-role', { sessionId, role: resolvedRole });

        const latestSession = await SessionCollaborative.findById(sessionObjectId)
          .select('whiteboard_state whiteboard_updated_at code_content code_language whiteboard_text')
          .lean();

        socket.emit('code-update', {
          code: latestSession?.code_content || '',
          language: latestSession?.code_language || 'web',
          timestamp: new Date().toISOString(),
          isInitial: true
        });

        socket.emit('text-update', {
          text: latestSession?.whiteboard_text || '',
          timestamp: new Date().toISOString(),
          isInitial: true
        });

        socket.emit('whiteboard-state', {
          sessionId,
          state: latestSession?.whiteboard_state || [],
          updatedAt: latestSession?.whiteboard_updated_at || null
        });

        const participantsPayload = await getParticipantsPayload(sessionObjectId);
        io.to(sessionRoomName(sessionId)).emit('participant-update', participantsPayload);

        const systemMessage = await Message.create({
          chat_room_id: chatRoom._id,
          session_id: sessionObjectId,
          user_id: userId,
          user_info: safeUserInfo,
          type: 'system',
          contenu: `${safeUserInfo.prenom || safeUserInfo.nom} a rejoint la session`
        });

        io.to(sessionRoomName(sessionId)).emit('new-message', buildMessagePayload(systemMessage));
      } catch (error) {
        logger.error('Error join-session:', error);
        socket.emit('session-error', { error: 'Erreur lors de la connexion à la session' });
      }
    });

    socket.on('send-message', async (data) => {
      try {
        const {
          sessionId,
          message,
          type = 'text',
          file_url = null,
          file_meta = null
        } = data || {};
        const sessionObjectId = toObjectId(sessionId);
        const safeMessage = (message || '').toString().trim();
        const hasFilePayload = Boolean(file_url);

        if (!sessionObjectId || (!safeMessage && !hasFilePayload)) {
          socket.emit('message-error', {
            error: 'sessionId et message ou fichier sont requis'
          });
          return;
        }

        const chatRoom = await ChatRoom.findOne({ session_id: sessionObjectId });
        if (!chatRoom) {
          socket.emit('message-error', {
            error: 'Chat room introuvable'
          });
          return;
        }

        const userInfo = socket.user || {
          id: data?.userId,
          nom: data?.userInfo?.nom,
          prenom: data?.userInfo?.prenom,
          avatar_url: data?.userInfo?.avatar_url
        };

        if (!userInfo?.id) {
          socket.emit('message-error', { error: 'Utilisateur non identifié' });
          return;
        }

        const mentionParticipants = await getMentionParticipants(
          sessionObjectId,
          safeMessage,
          Number(userInfo.id)
        );
        const mentionUserIds = mentionParticipants.map((participant) => participant.user_id);
        const mentionsMeta = mentionParticipants.map((participant) => ({
          user_id: participant.user_id,
          nom: participant.user_info?.nom,
          prenom: participant.user_info?.prenom,
          role: participant.role || 'participant'
        }));

        const newMessage = await Message.create({
          chat_room_id: chatRoom._id,
          session_id: sessionObjectId,
          user_id: userInfo.id,
          user_info: {
            nom: userInfo.nom,
            prenom: userInfo.prenom,
            avatar_url: userInfo.avatar_url
          },
          type,
          contenu: safeMessage || `Fichier partagé: ${file_meta?.name || 'document'}`,
          file_url,
          file_meta,
          mentions: mentionUserIds,
          mentions_meta: mentionsMeta
        });

        await ChatRoom.updateOne(
          { session_id: sessionObjectId },
          { $set: { last_activity: new Date() } }
        );

        io.to(sessionRoomName(sessionId)).emit('new-message', buildMessagePayload(newMessage));

        await emitMentionNotifications(io, mentionParticipants, newMessage, {
          nom: userInfo.nom,
          prenom: userInfo.prenom,
          avatar_url: userInfo.avatar_url
        });

        if (KAVT_ENABLED && type === 'text' && safeMessage && isKavtMentioned(safeMessage)) {
          const question = extractKavtQuestion(safeMessage);
          const trimmedQuestion = question.slice(0, Math.max(0, KAVT_MAX_QUESTION_CHARS)).trim();
          const limiterKey = `${userInfo.id}:${sessionId}`;
          const rate = kavtRateLimiter.check({ key: limiterKey });

          const run = async () => {
            if (!trimmedQuestion) {
              const assistantMessage = await Message.create({
                chat_room_id: chatRoom._id,
                session_id: sessionObjectId,
                user_id: KAVT_USER_ID,
                user_info: buildKavtUserInfo(),
                type: 'text',
                contenu: "Je peux aider — précise ta question après @kavt (ex: “@kavt explique la loi d'Ohm”)."
              });
              io.to(sessionRoomName(sessionId)).emit('new-message', buildMessagePayload(assistantMessage));
              return;
            }

            if (!rate.ok) {
              const seconds = Math.ceil(rate.retryAfterMs / 1000);
              const assistantMessage = await Message.create({
                chat_room_id: chatRoom._id,
                session_id: sessionObjectId,
                user_id: KAVT_USER_ID,
                user_info: buildKavtUserInfo(),
                type: 'text',
                contenu: `Trop de requêtes. Réessaie dans ${seconds}s.`
              });
              io.to(sessionRoomName(sessionId)).emit('new-message', buildMessagePayload(assistantMessage));
              return;
            }

            logger.info('KAVT ask', {
              sessionId,
              userId: userInfo.id,
              model: KAVT_MODEL,
              questionPreview: trimmedQuestion.slice(0, 180)
            });

            await streamKavtAnswer({
              io,
              sessionId,
              sessionObjectId,
              chatRoomId: chatRoom._id,
              askerUserInfo: {
                nom: userInfo.nom,
                prenom: userInfo.prenom,
                avatar_url: userInfo.avatar_url
              },
              question: trimmedQuestion
            });
          };

          run().catch((error) => {
            logger.error('KAVT run error:', error);
          });
        }
      } catch (error) {
        logger.error('Error send-message:', error);
        socket.emit('message-error', { error: 'Erreur lors de l\'envoi du message' });
      }
    });

    socket.on('typing-start', (data) => {
      const { sessionId, userId, userInfo } = data || {};
      if (!sessionId || !userId) return;

      io.to(sessionRoomName(sessionId)).emit('typing', {
        userId,
        userInfo,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      const { sessionId, userId, userInfo } = data || {};
      if (!sessionId || !userId) return;

      io.to(sessionRoomName(sessionId)).emit('typing', {
        userId,
        userInfo,
        isTyping: false
      });
    });

    socket.on('whiteboard-draw', async (data) => {
      const { sessionId, action = 'draw', ...payload } = data || {};
      if (!sessionId) return;

      const sessionObjectId = toObjectId(sessionId);
      if (!sessionObjectId) return;

      try {
        if (action === 'clear') {
          await SessionCollaborative.updateOne(
            { _id: sessionObjectId },
            {
              $set: {
                whiteboard_state: [],
                whiteboard_updated_at: new Date()
              }
            }
          );

          io.to(sessionRoomName(sessionId)).emit('whiteboard-update', {
            action: 'clear',
            by: socket.user?.id || null,
            timestamp: new Date().toISOString()
          });
          return;
        }

        const boardEvent = {
          action,
          data: payload.data || payload,
          user_id: socket.user?.id || null,
          created_at: new Date()
        };

        // 1. Émettre immédiatement pour une réactivité maximale (Temps Réel)
        // On utilise socket.broadcast.to pour ne pas le renvoyer à l'émetteur
        socket.broadcast.to(sessionRoomName(sessionId)).emit('whiteboard-update', {
          action,
          ...payload,
          by: socket.user?.id || null,
          timestamp: new Date().toISOString()
        });

        // 2. Sauvegarder en arrière-plan sans bloquer l'émission
        SessionCollaborative.updateOne(
          { _id: sessionObjectId },
          {
            $push: {
              whiteboard_state: {
                $each: [boardEvent],
                $slice: -MAX_WHITEBOARD_ACTIONS
              }
            },
            $set: {
              whiteboard_updated_at: new Date()
            }
          }
        ).catch(err => logger.error('Error saving whiteboard state:', err));
      } catch (error) {
        logger.error('Error whiteboard-draw:', error);
      }
    });

    socket.on('code-update', async (data) => {
      const { sessionId, code, language } = data || {};
      if (!sessionId) return;
      const sessionObjectId = toObjectId(sessionId);
      if (!sessionObjectId) return;

      try {
        // 1. Diffusion immédiate aux autres
        socket.to(sessionRoomName(sessionId)).emit('code-update', {
          code,
          language,
          by: socket.user?.id || null,
          timestamp: new Date().toISOString()
        });

        // 2. Sauvegarde asynchrone
        SessionCollaborative.updateOne(
          { _id: sessionObjectId },
          {
            $set: {
              code_content: code,
              code_language: language,
              updatedAt: new Date()
            }
          }
        ).catch(err => logger.error('Error saving code content:', err));
      } catch (error) {
        logger.error('Error code-update:', error);
      }
    });

    socket.on('text-update', async (data) => {
      const { sessionId, text } = data || {};
      if (!sessionId) return;
      const sessionObjectId = toObjectId(sessionId);
      if (!sessionObjectId) return;

      try {
        // 1. Diffusion immédiate
        socket.to(sessionRoomName(sessionId)).emit('text-update', {
          text,
          by: socket.user?.id || null,
          timestamp: new Date().toISOString()
        });

        // 2. Sauvegarde asynchrone
        SessionCollaborative.updateOne(
          { _id: sessionObjectId },
          {
            $set: {
              whiteboard_text: text,
              updatedAt: new Date()
            }
          }
        ).catch(err => logger.error('Error saving whiteboard text:', err));
      } catch (error) {
        logger.error('Error text-update:', error);
      }
    });

    socket.on('whiteboard-sync-request', async (data) => {
      try {
        const { sessionId } = data || {};
        const sessionObjectId = toObjectId(sessionId);
        if (!sessionObjectId) return;

        const session = await SessionCollaborative.findById(sessionObjectId)
          .select('whiteboard_state whiteboard_updated_at')
          .lean();

        socket.emit('whiteboard-state', {
          sessionId,
          state: session?.whiteboard_state || [],
          updatedAt: session?.whiteboard_updated_at || null
        });
      } catch (error) {
        logger.error('Error whiteboard-sync-request:', error);
      }
    });

    socket.on('leave-session', async (data) => {
      try {
        const { sessionId, userId } = data || {};
        const sessionObjectId = toObjectId(sessionId);

        if (!sessionObjectId || !userId) return;

        await SessionParticipant.findOneAndUpdate(
          { session_id: sessionObjectId, user_id: userId },
          { $set: { statut: 'absent', left_at: new Date() } }
        );

        await OnlineUser.findOneAndUpdate(
          { user_id: userId },
          { $set: { status: 'away', current_session_id: null, last_activity: new Date() } }
        );

        await ChatRoom.updateOne(
          { session_id: sessionObjectId },
          { $pull: { active_users: { user_id: userId } } }
        );

        await SessionEvent.create({
          session_id: sessionObjectId,
          user_id: userId,
          user_info: {
            nom: socket.user?.nom,
            prenom: socket.user?.prenom
          },
          event_type: 'left'
        });

        const participantsPayload = await getParticipantsPayload(sessionObjectId);
        io.to(sessionRoomName(sessionId)).emit('participant-update', participantsPayload);

        socket.leave(sessionRoomName(sessionId));
      } catch (error) {
        logger.error('Error leave-session:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        if (!socket.user || !socket.currentSessionId) return;

        const sessionObjectId = toObjectId(socket.currentSessionId);
        const userId = socket.user.id;

        if (!sessionObjectId || !userId) return;

        await SessionParticipant.findOneAndUpdate(
          { session_id: sessionObjectId, user_id: userId },
          { $set: { statut: 'absent', left_at: new Date() } }
        );

        await OnlineUser.findOneAndUpdate(
          { user_id: userId },
          { $set: { status: 'away', current_session_id: null, last_activity: new Date() } }
        );

        await ChatRoom.updateOne(
          { session_id: sessionObjectId },
          { $pull: { active_users: { user_id: userId } } }
        );

        const participantsPayload = await getParticipantsPayload(sessionObjectId);
        io.to(sessionRoomName(socket.currentSessionId)).emit('participant-update', participantsPayload);
      } catch (error) {
        logger.error('Error disconnect:', error);
      }
    });
  });

  return io;
};
