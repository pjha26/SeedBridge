import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

// ── GET / — own notifications (paginated + unreadCount) ───────────────────────

export async function getNotifications(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const [total, data, unreadCount] = await Promise.all([
      Notification.countDocuments({ user: req.user.userId }),
      Notification.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: req.user.userId, read: false }),
    ]);

    return res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /:id/read — mark one notification as read ───────────────────────────

export async function markOneRead(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    notification.read = true;
    await notification.save();

    return res.json({ notification });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /read-all — mark all own notifications as read ──────────────────────

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { user: req.user.userId, read: false },
      { $set: { read: true } }
    );
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
