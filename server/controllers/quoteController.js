const asyncHandler = require('express-async-handler');
const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const TechnicianProfile = require('../models/TechnicianProfile');
const notify = require('../utils/notify');

// @desc    Technician submits a quote for a service request
// @route   POST /api/quotes
// @access  Private/Technician
const submitQuote = asyncHandler(async (req, res) => {
  const { serviceRequestId, estimatedPrice, visitCharge, estimatedArrival, message } = req.body;

  const request = await ServiceRequest.findById(serviceRequestId);
  if (!request) {
    res.status(404);
    throw new Error('Service request not found');
  }
  if (request.status !== 'open' && request.status !== 'quoted') {
    res.status(400);
    throw new Error('This request is no longer accepting quotes');
  }

  const existing = await Quote.findOne({ serviceRequest: serviceRequestId, technician: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already submitted a quote for this request');
  }

  if (estimatedPrice === undefined || Number(estimatedPrice) < 0) {
    res.status(400);
    throw new Error('A valid estimated price is required');
  }

  const quote = await Quote.create({
    serviceRequest: serviceRequestId,
    technician: req.user._id,
    estimatedPrice,
    visitCharge: visitCharge || 0,
    estimatedArrival,
    message,
  });

  if (request.status === 'open') {
    request.status = 'quoted';
    await request.save();
  }

  await notify({
    recipientId: request.customer,
    type: 'new_quote',
    title: 'You received a new quote',
    message: `A technician quoted ₹${estimatedPrice} for your request "${request.title}".`,
    link: `/customer/requests/${request._id}`,
    relatedId: quote._id,
  });

  res.status(201).json({ success: true, quote });
});

// @desc    Get all quotes for a given service request (for comparison)
// @route   GET /api/quotes/request/:serviceRequestId
// @access  Private/Customer (owner)
const getQuotesForRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.serviceRequestId);
  if (!request) {
    res.status(404);
    throw new Error('Service request not found');
  }
  if (String(request.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only view quotes for your own requests');
  }

  const quotes = await Quote.find({ serviceRequest: req.params.serviceRequestId, status: { $ne: 'withdrawn' } })
    .populate({
      path: 'technician',
      select: 'name avatarUrl',
    })
    .sort('estimatedPrice');

  // Enrich each quote with the technician's trust stats for side-by-side comparison.
  const enriched = await Promise.all(
    quotes.map(async (q) => {
      const profile = await TechnicianProfile.findOne({ user: q.technician._id }).select(
        'stats pricing headline'
      );
      const obj = q.toObject();
      obj.technicianStats = profile ? profile.stats : null;
      obj.technicianHeadline = profile ? profile.headline : '';
      return obj;
    })
  );

  res.json({ success: true, quotes: enriched });
});

// @desc    Get quotes submitted by the logged-in technician
// @route   GET /api/quotes/mine
// @access  Private/Technician
const getMyQuotes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { technician: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [quotes, total] = await Promise.all([
    Quote.find(filter)
      .populate({ path: 'serviceRequest', select: 'title status category', populate: { path: 'category', select: 'name' } })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Quote.countDocuments(filter),
  ]);

  res.json({ success: true, quotes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Customer accepts a quote -> creates a Booking, rejects competing quotes
// @route   PUT /api/quotes/:id/accept
// @access  Private/Customer
const acceptQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) {
    res.status(404);
    throw new Error('Quote not found');
  }

  const request = await ServiceRequest.findById(quote.serviceRequest);
  if (!request) {
    res.status(404);
    throw new Error('Service request not found');
  }
  if (String(request.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only accept quotes on your own requests');
  }
  if (request.status === 'booked') {
    res.status(400);
    throw new Error('This request already has a confirmed booking');
  }
  if (quote.status !== 'pending') {
    res.status(400);
    throw new Error('This quote is no longer available');
  }

  quote.status = 'accepted';
  await quote.save();

  // Auto-reject/close all competing quotes for this request.
  const competing = await Quote.find({
    serviceRequest: request._id,
    _id: { $ne: quote._id },
    status: 'pending',
  });
  await Promise.all(
    competing.map(async (c) => {
      c.status = 'rejected';
      await c.save();
      await notify({
        recipientId: c.technician,
        type: 'quote_rejected',
        title: 'Your quote was not selected',
        message: `The customer chose another quote for "${request.title}".`,
        link: `/technician/quotes`,
        relatedId: c._id,
        email: false,
      });
    })
  );

  request.status = 'booked';
  await request.save();

  const booking = await Booking.create({
    serviceRequest: request._id,
    quote: quote._id,
    customer: request.customer,
    technician: quote.technician,
    category: request.category,
    agreedPrice: quote.estimatedPrice,
    finalPrice: quote.estimatedPrice,
    customerContactPhone: request.contactPhone || '',
    servicePassportItem: request.servicePassportItem || undefined,
    status: 'pending_start',
    statusHistory: [{ status: 'pending_start', changedBy: req.user._id, note: 'Booking created from accepted quote' }],
  });

  await notify({
    recipientId: quote.technician,
    type: 'quote_accepted',
    title: 'Your quote was accepted!',
    message: `Your quote for "${request.title}" was accepted. A booking has been created.`,
    link: `/technician/bookings/${booking._id}`,
    relatedId: booking._id,
  });

  res.json({ success: true, booking });
});

module.exports = { submitQuote, getQuotesForRequest, getMyQuotes, acceptQuote };
