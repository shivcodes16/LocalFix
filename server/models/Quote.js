const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    visitCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedArrival: {
      // free text, e.g. "Today, 4-6 PM" or an ISO date string
      type: String,
      default: '',
    },
    message: {
      type: String,
      maxlength: 800,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

quoteSchema.index({ serviceRequest: 1, technician: 1 }, { unique: true });
quoteSchema.index({ technician: 1, status: 1 });

module.exports = mongoose.model('Quote', quoteSchema);
