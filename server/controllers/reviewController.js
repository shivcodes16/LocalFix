const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const TechnicianProfile = require('../models/TechnicianProfile');
const notify = require('../utils/notify');

// Recalculates a technician's average rating/review count from all their reviews.
const recalculateTechnicianRating = async (technicianId) => {
  const stats = await Review.aggregate([
    { $match: { technician: technicianId } },
    { $group: { _id: '$technician', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const profile = await TechnicianProfile.findOne({ user: technicianId });
  if (!profile) return;

  if (stats.length > 0) {
    profile.stats.averageRating = Number(stats[0].avgRating.toFixed(2));
    profile.stats.reviewCount = stats[0].count;
  } else {
    profile.stats.averageRating = 0;
    profile.stats.reviewCount = 0;
  }
  await profile.save();
};

// @desc    Leave a review — only allowed for a verified, not-yet-reviewed booking
// @route   POST /api/reviews
// @access  Private/Customer
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, punctualityRating, qualityRating } = req.body;

  if (!bookingId || !rating) {
    res.status(400);
    throw new Error('Booking id and rating are required');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only review your own bookings');
  }
  // The critical trust gate: reviews require a verified booking.
  if (!booking.isVerified || booking.status !== 'verified') {
    res.status(400);
    throw new Error('You can only review a booking once it has been verified as completed');
  }
  if (booking.isReviewed) {
    res.status(400);
    throw new Error('This booking has already been reviewed');
  }

  const review = await Review.create({
    booking: booking._id,
    customer: req.user._id,
    technician: booking.technician,
    rating,
    comment,
    punctualityRating,
    qualityRating,
    isVerifiedJob: true,
  });

  booking.isReviewed = true;
  await booking.save();

  await recalculateTechnicianRating(booking.technician);

  await notify({
    recipientId: booking.technician,
    type: 'new_review',
    title: 'You received a new review',
    message: `A customer left you a ${rating}-star review.`,
    link: `/technician/reviews`,
    relatedId: review._id,
    email: false,
  });

  res.status(201).json({ success: true, review });
});

// @desc    Get reviews for a technician (public)
// @route   GET /api/reviews/technician/:userId
// @access  Public
const getTechnicianReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ technician: req.params.userId })
      .populate('customer', 'name avatarUrl')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ technician: req.params.userId }),
  ]);

  res.json({ success: true, reviews, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Technician replies to a review
// @route   PUT /api/reviews/:id/reply
// @access  Private/Technician
const replyToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (String(review.technician) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only reply to your own reviews');
  }

  review.technicianReply = { text, repliedAt: new Date() };
  await review.save();

  res.json({ success: true, review });
});

module.exports = { createReview, getTechnicianReviews, replyToReview };
