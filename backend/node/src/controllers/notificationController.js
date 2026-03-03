/**
 * @file notificationController.js
 * @description Contrôleur des notifications temps réel.
 */

const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { is_read } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const query = { user_id: req.user.id };

    if (is_read === 'true') {
      query.is_read = true;
    } else if (is_read === 'false') {
      query.is_read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [total, unreadCount] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({ user_id: req.user.id, is_read: false })
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

/**
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user_id: req.user.id,
      is_read: false
    });

    return res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    logger.error('Error getting unread notifications count:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du compteur des notifications',
      error: error.message
    });
  }
};

/**
 * POST /api/notifications
 */
exports.createNotification = async (req, res) => {
  try {
    const { type, titre, message, action_url, data, expires_at } = req.body;
    // Sécurité : toujours utiliser l'ID de l'utilisateur authentifié
    // (un admin peut cibler un autre user via user_id uniquement)
    const targetUserId = (req.user.role === 'admin' && req.body.user_id)
      ? req.body.user_id
      : req.user.id;

    if (!type || !titre || !message) {
      return res.status(400).json({
        success: false,
        message: 'type, titre et message sont requis'
      });
    }

    const notification = new Notification({
      user_id: targetUserId,
      type,
      titre,
      message,
      action_url,
      data,
      expires_at
    });

    await notification.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${targetUserId}`).emit('notification', notification);
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { $set: { is_read: true, read_at: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification introuvable'
      });
    }

    res.json({ success: true, notification });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { $set: { is_read: true, read_at: now } }
    );

    return res.json({
      success: true,
      updated: result.modifiedCount || 0,
      read_at: now
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notifications',
      error: error.message
    });
  }
};

/**
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user_id: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification introuvable'
      });
    }

    res.json({ success: true, message: 'Notification supprimée' });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification',
      error: error.message
    });
  }
};
