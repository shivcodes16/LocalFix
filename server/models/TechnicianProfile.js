const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true,
    },
    startTime: { type: String, default: '09:00' }, // "HH:mm"
    endTime: { type: String, default: '18:00' },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const technicianProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      maxlength: 120,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 1500,
      default: '',
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
      },
    ],
    subcategories: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricing: {
      visitCharge: { type: Number, default: 0 },
      minPrice: { type: Number, default: 0 },
      maxPrice: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    serviceAreas: {
      // list of localities/cities the technician is willing to serve
      type: [String],
      default: [],
    },
    serviceRadiusKm: {
      type: Number,
      default: 10,
    },
    workImages: {
      type: [String],
      default: [],
    },
    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },
    isAcceptingRequests: {
      type: Boolean,
      default: true,
    },
    stats: {
      completedJobs: { type: Number, default: 0 },
      verifiedJobs: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      repeatCustomerCount: { type: Number, default: 0 },
    },
    verification: {
      idVerified: { type: Boolean, default: false },
      documentsSubmitted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

technicianProfileSchema.index({ categories: 1 });
technicianProfileSchema.index({ 'stats.averageRating': -1 });
technicianProfileSchema.index({ 'stats.verifiedJobs': -1 });

module.exports = mongoose.model('TechnicianProfile', technicianProfileSchema);
