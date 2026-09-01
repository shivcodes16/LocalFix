const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const TechnicianProfile = require('../models/TechnicianProfile');
const ServicePassportItem = require('../models/ServicePassportItem');
const { uploadMultipleImages } = require('../utils/imageUpload');
const { summarizeServiceNotes } = require('../utils/aiService');
const notify = require('../utils/notify');

const populateBooking = (query) =>
  query
    .populate('customer', 'name avatarUrl phone')
    .populate('technician', 'name avatarUrl phone')
    .populate('category', 'name icon')
    .populate('serviceRequest', 'title description images');

// @desc    Get my bookings (customer or technician, based on role)
// @route   GET /api/bookings/mine
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = req.user.role === 'technician' ? { technician: req.user._id } : { customer: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    populateBooking(Booking.find(filter)).sort('-createdAt').skip(skip).limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Get a single booking by id
// @route   GET /api/bookings/:id
// @access  Private (participant only)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await populateBooking(Booking.findById(req.params.id));
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isParticipant =
    String(booking.customer._id) === String(req.user._id) || String(booking.technician._id) === String(req.user._id);
  if (!isParticipant && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You do not have access to this booking');
  }

  res.json({ success: true, booking });
});

// @desc    Technician marks the job as in progress
// @route   PUT /api/bookings/:id/start
// @access  Private/Technician
const startJob = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.technician) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the assigned technician can update this booking');
  }
  if (booking.status !== 'pending_start') {
    res.status(400);
    throw new Error(`Cannot start a job that is currently '${booking.status}'`);
  }

  booking.pushStatus('in_progress', req.user._id, 'Technician started the job');
  await booking.save();

  await notify({
    recipientId: booking.customer,
    type: 'booking_status_changed',
    title: 'Your service is in progress',
    message: 'Your technician has started work on your request.',
    link: `/customer/bookings/${booking._id}`,
    relatedId: booking._id,
    email: false,
  });

  res.json({ success: true, booking });
});

// @desc    Technician adds a service note (optionally AI-summarized, with images)
// @route   POST /api/bookings/:id/notes
// @access  Private/Technician
const addServiceNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error('Note text is required');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.technician) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the assigned technician can add notes');
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadMultipleImages(req.files, 'localfix/service-notes');
  }

  const aiSummary = await summarizeServiceNotes(text);

  booking.serviceNotes.push({
    text,
    images,
    addedBy: req.user._id,
    aiSummary,
  });
  await booking.save();

  res.status(201).json({ success: true, serviceNotes: booking.serviceNotes });
});

// @desc    Technician marks the job as completed (awaiting customer confirmation)
// @route   PUT /api/bookings/:id/complete
// @access  Private/Technician
const markCompletedByTechnician = asyncHandler(async (req, res) => {
  const { finalPrice, warrantyPeriodDays } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.technician) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the assigned technician can complete this booking');
  }
  if (!['pending_start', 'in_progress'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Cannot complete a job that is currently '${booking.status}'`);
  }

  if (finalPrice !== undefined) booking.finalPrice = Number(finalPrice);
  if (warrantyPeriodDays !== undefined) booking.warrantyPeriodDays = Number(warrantyPeriodDays);
  booking.technicianCompletedAt = new Date();
  booking.pushStatus('completed_by_technician', req.user._id, 'Technician marked job as completed');
  await booking.save();

  await notify({
    recipientId: booking.customer,
    type: 'job_completed',
    title: 'Your technician marked the job as done',
    message: 'Please confirm the job is complete so it can be verified and you can leave a review.',
    link: `/customer/bookings/${booking._id}`,
    relatedId: booking._id,
  });

  res.json({ success: true, booking });
});

// @desc    Customer confirms completion -> booking becomes VERIFIED
//          This is the single gate that unlocks reviews and updates trust stats.
// @route   PUT /api/bookings/:id/confirm
// @access  Private/Customer
const confirmCompletion = asyncHandler(async (req, res) => {
  const { addToServicePassport, serviceType, cost, notes, warrantyPeriodDays, productName } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the customer on this booking can confirm completion');
  }
  if (booking.status !== 'completed_by_technician') {
    res.status(400);
    throw new Error('The technician must mark the job complete before you can confirm it');
  }

  booking.customerConfirmedAt = new Date();
  booking.isVerified = true;
  booking.pushStatus('verified', req.user._id, 'Customer confirmed job completion');
  await booking.save();

  // Update technician trust stats.
  const profile = await TechnicianProfile.findOne({ user: booking.technician });
  if (profile) {
    profile.stats.completedJobs += 1;
    profile.stats.verifiedJobs += 1;

    // Detect repeat customer: any other verified booking between this pair.
    const priorVerifiedCount = await Booking.countDocuments({
      customer: booking.customer,
      technician: booking.technician,
      isVerified: true,
      _id: { $ne: booking._id },
    });
    if (priorVerifiedCount > 0 && priorVerifiedCount === 1) {
      // Count this pair as a repeat customer the first time we see a 2nd verified job.
      profile.stats.repeatCustomerCount += 1;
    }
    await profile.save();
  }

  // Optionally log this into the customer's Service Passport.
  if (addToServicePassport) {
    let item;
    if (booking.servicePassportItem) {
      item = await ServicePassportItem.findById(booking.servicePassportItem);
    }
    if (!item && productName) {
      item = await ServicePassportItem.create({
        customer: booking.customer,
        productName,
        category: booking.category,
      });
      booking.servicePassportItem = item._id;
      await booking.save();
    }
    if (item) {
      item.history.push({
        booking: booking._id,
        technician: booking.technician,
        serviceType: serviceType || 'Service completed',
        cost: cost !== undefined ? Number(cost) : booking.finalPrice,
        notes: notes || '',
        warrantyExpiresAt:
          warrantyPeriodDays || booking.warrantyPeriodDays
            ? new Date(Date.now() + (Number(warrantyPeriodDays || booking.warrantyPeriodDays) * 86400000))
            : undefined,
      });
      await item.save();
    }
  }

  await notify({
    recipientId: booking.technician,
    type: 'completion_confirmed',
    title: 'Job verified!',
    message: 'The customer confirmed job completion. This is now a verified job on your profile.',
    link: `/technician/bookings/${booking._id}`,
    relatedId: booking._id,
  });

  res.json({ success: true, booking });
});

// @desc    Raise a dispute instead of confirming (customer)
// @route   PUT /api/bookings/:id/dispute
// @access  Private/Customer
const disputeBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the customer on this booking can dispute it');
  }
  if (booking.status !== 'completed_by_technician') {
    res.status(400);
    throw new Error('Only jobs marked complete by the technician can be disputed');
  }

  booking.pushStatus('disputed', req.user._id, reason || 'Customer disputed job completion');
  await booking.save();

  await notify({
    recipientId: booking.technician,
    type: 'booking_status_changed',
    title: 'A customer disputed a job',
    message: `The customer disputed completion of a booking. Reason: ${reason || 'Not specified'}.`,
    link: `/technician/bookings/${booking._id}`,
    relatedId: booking._id,
  });

  res.json({ success: true, booking });
});

// @desc    Cancel a booking (either participant, only before verified/completed)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isParticipant =
    String(booking.customer) === String(req.user._id) || String(booking.technician) === String(req.user._id);
  if (!isParticipant) {
    res.status(403);
    throw new Error('You are not part of this booking');
  }
  if (['verified', 'cancelled'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Cannot cancel a booking that is '${booking.status}'`);
  }

  booking.pushStatus('cancelled', req.user._id, `Cancelled by ${req.user.role}`);
  await booking.save();

  const otherParty = String(booking.customer) === String(req.user._id) ? booking.technician : booking.customer;
  await notify({
    recipientId: otherParty,
    type: 'booking_status_changed',
    title: 'Booking cancelled',
    message: `The booking was cancelled by the ${req.user.role}.`,
    link: `/bookings/${booking._id}`,
    relatedId: booking._id,
    email: false,
  });

  res.json({ success: true, booking });
});

module.exports = {
  getMyBookings,
  getBookingById,
  startJob,
  addServiceNote,
  markCompletedByTechnician,
  confirmCompletion,
  disputeBooking,
  cancelBooking,
};
