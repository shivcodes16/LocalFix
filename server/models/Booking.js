const mongoose = require('mongoose');

// Booking status flow (the trust pipeline):
// pending_start -> in_progress -> completed_by_technician -> verified -> (reviewed)
// Can also end in: disputed, cancelled
const STATUSES = [
  'pending_start',
  'in_progress',
  'completed_by_technician',
  'verified',
  'disputed',
  'cancelled',
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const serviceNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 2000 },
    images: { type: [String], default: [] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    aiSummary: { type: String, default: '' },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Snapshot of the customer's contact phone for this specific booking,
    // copied from the originating ServiceRequest (or the customer's account
    // phone as a fallback) at the moment the quote is accepted. Only ever
    // exposed to the technician assigned to this booking (see
    // bookingController.js access checks) — never to unrelated technicians.
    customerContactPhone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    finalPrice: {
      // technician can adjust with notes at completion; defaults to agreedPrice
      type: Number,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending_start',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    serviceNotes: {
      type: [serviceNoteSchema],
      default: [],
    },
    scheduledDate: {
      type: Date,
    },
    technicianCompletedAt: {
      type: Date,
    },
    customerConfirmedAt: {
      type: Date,
    },
    isVerified: {
      // true only once the customer has confirmed completion
      type: Boolean,
      default: false,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    servicePassportItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServicePassportItem',
    },
    warrantyPeriodDays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ technician: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

bookingSchema.methods.pushStatus = function pushStatus(status, changedBy, note = '') {
  this.status = status;
  this.statusHistory.push({ status, changedBy, note, changedAt: new Date() });
};

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.STATUSES = STATUSES;
