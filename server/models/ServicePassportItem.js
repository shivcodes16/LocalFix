const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceType: { type: String, required: true }, // e.g. "Gas refill", "Cleaning"
    date: { type: Date, default: Date.now },
    cost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    warrantyExpiresAt: { type: Date },
  },
  { _id: true, timestamps: true }
);

const servicePassportItemSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      maxlength: 120,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
    },
    brand: { type: String, default: '' },
    purchaseDate: { type: Date },
    notes: { type: String, default: '', maxlength: 1000 },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

servicePassportItemSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('ServicePassportItem', servicePassportItemSchema);
