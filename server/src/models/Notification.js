import mongoose from 'mongoose';
import { NOTIFICATION_TYPE_VALUES } from '../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    // The user who should receive this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,      // most queries are { user: x, read: false } — index here helps
    },
    type: {
      type: String,
      required: true,
      // Values are defined in constants.js NOTIFICATION_TYPE_VALUES.
      // Add new types there; this enum stays in sync automatically.
      enum: NOTIFICATION_TYPE_VALUES,
    },
    message: {
      type: String,
      required: true,
      maxlength: 300,
    },
    // Optional link back to the InterestRequest that triggered this notification.
    // Lets the client deep-link from a notification to the request detail.
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterestRequest',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 }, { name: 'user_read_date' });

export default mongoose.model('Notification', notificationSchema);
