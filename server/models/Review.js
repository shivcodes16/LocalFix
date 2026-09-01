const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // one review per verified booking
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    punctualityRating: { type: Number, min: 1, max: 5 },
    qualityRating: { type: Number, min: 1, max: 5 },
    technicianReply: {
      text: { type: String, maxlength: 500, default: '' },
      repliedAt: { type: Date },
    },
    isVerifiedJob: {
      // always true by construction, kept explicit for query clarity/trust badge
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ technician: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
