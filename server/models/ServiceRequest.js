const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    subcategory: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    // The phone number the customer wants used for this specific request/booking.
    // Kept separate from the account-level User.phone so a customer can give a
    // different contact number per job if they want to. Optional so existing
    // service requests created before this field existed remain valid.
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
    },
    preferredDate: {
      type: Date,
    },
    // technicians this request has been (or should be) broadcast to.
    // In an open marketplace it can also be left empty to mean "open to all nearby".
    targetedTechnicians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    aiSuggestion: {
      suggestedCategory: { type: String, default: '' },
      suggestedSubcategory: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      rawModelOutput: { type: String, default: '' },
      source: { type: String, enum: ['ai', 'fallback', 'none'], default: 'none' },
    },
    status: {
      type: String,
      enum: ['open', 'quoted', 'booked', 'cancelled', 'expired'],
      default: 'open',
    },
    servicePassportItem: {
      // optional link back to a customer's tracked product/appliance
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServicePassportItem',
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ customer: 1, createdAt: -1 });
serviceRequestSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
