const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'new_service_request',
  'new_quote',
  'quote_accepted',
  'quote_rejected',
  'booking_status_changed',
  'job_completed',
  'completion_confirmed',
  'new_review',
  'booking_update',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      // frontend route to deep-link into, e.g. /bookings/:id
      type: String,
      default: '',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
