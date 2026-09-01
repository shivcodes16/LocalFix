const asyncHandler = require('express-async-handler');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const TechnicianProfile = require('../models/TechnicianProfile');
const Notification = require('../models/Notification');
const { classifyServiceRequest } = require('../utils/aiService');
const { uploadMultipleImages } = require('../utils/imageUpload');
const { isValidPhone } = require('../utils/validators');
const notify = require('../utils/notify');

// @desc    AI-assist: classify a free-text problem description
// @route   POST /api/service-requests/classify
// @access  Private/Customer
const classifyProblem = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description || description.trim().length < 5) {
    res.status(400);
    throw new Error('Please provide a short description of the problem.');
  }

  const categories = await ServiceCategory.find({ isActive: true }).select('name');
  const suggestion = await classifyServiceRequest(description, categories.map((c) => c.name));

  res.json({
    success: true,
    suggestion: {
      ...suggestion,
      disclaimer:
        'This is only a suggested service category to help route your request, not a technical diagnosis.',
    },
  });
});

// @desc    Create a new service request
// @route   POST /api/service-requests
// @access  Private/Customer
const createServiceRequest = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    title,
    description,
    address,
    city,
    lat,
    lng,
    preferredDate,
    contactPhone,
    aiSuggestion,
    servicePassportItem,
  } = req.body;

  if (!category || !title || !description) {
    res.status(400);
    throw new Error('Category, title and description are required.');
  }

  // Fall back to the customer's account phone if none was entered on the
  // form, so existing clients that don't send this field don't break.
  const resolvedContactPhone = (contactPhone && contactPhone.trim()) || req.user.phone || '';

  if (!resolvedContactPhone) {
    res.status(400);
    throw new Error('A contact phone number is required so a technician can reach you.');
  }
  if (!isValidPhone(resolvedContactPhone)) {
    res.status(400);
    throw new Error('Please enter a valid contact phone number.');
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadMultipleImages(req.files, 'localfix/service-requests');
  }

  const serviceRequest = await ServiceRequest.create({
    customer: req.user._id,
    category,
    subcategory,
    title,
    description,
    images,
    contactPhone: resolvedContactPhone,
    location: {
      coordinates: lat && lng ? [Number(lng), Number(lat)] : [0, 0],
      address: address || req.user.location?.address || '',
      city: city || req.user.location?.city || '',
    },
    preferredDate: preferredDate || undefined,
    aiSuggestion: aiSuggestion || undefined,
    servicePassportItem: servicePassportItem || undefined,
  });

  // Notify nearby technicians in the matching category (best-effort, capped).
  const matchingTechs = await TechnicianProfile.find({ categories: category, isAcceptingRequests: true })
    .limit(30)
    .select('user');

  await Promise.all(
    matchingTechs.map((t) =>
      notify({
        recipientId: t.user,
        type: 'new_service_request',
        title: 'New service request nearby',
        message: `A customer posted a new request: "${title}".`,
        link: `/technician/requests/${serviceRequest._id}`,
        relatedId: serviceRequest._id,
        email: false, // avoid spamming inboxes for every request; in-app is enough
      })
    )
  );

  res.status(201).json({ success: true, serviceRequest });
});

// @desc    Get my service requests (customer)
// @route   GET /api/service-requests/mine
// @access  Private/Customer
const getMyServiceRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter).populate('category', 'name icon').sort('-createdAt').skip(skip).limit(Number(limit)),
    ServiceRequest.countDocuments(filter),
  ]);

  res.json({ success: true, requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Browse open service requests relevant to the logged-in technician
// @route   GET /api/service-requests/open
// @access  Private/Technician
const getOpenServiceRequestsForTechnician = asyncHandler(async (req, res) => {
  const profile = await TechnicianProfile.findOne({ user: req.user._id });
  const filter = { status: 'open' };
  if (profile && profile.categories.length > 0) {
    filter.category = { $in: profile.categories };
  }

  const requests = await ServiceRequest.find(filter)
    .populate('category', 'name icon')
    .populate('customer', 'name avatarUrl')
    .sort('-createdAt')
    .limit(50);

  res.json({ success: true, requests });
});

// @desc    Get a single service request by id
// @route   GET /api/service-requests/:id
// @access  Private
const getServiceRequestById = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('customer', 'name avatarUrl phone');

  if (!request) {
    res.status(404);
    throw new Error('Service request not found');
  }

  const isOwner = String(request.customer._id) === String(req.user._id);

  const responseRequest = request.toObject();
  if (!isOwner) {
    // Privacy: the customer's phone number is only ever visible to the
    // customer themselves here. A technician only gains access to it once
    // they are the accepted technician on a Booking created from this
    // request (see bookingController.js), never while just browsing or
    // quoting on the open request.
    delete responseRequest.contactPhone;
    if (responseRequest.customer) delete responseRequest.customer.phone;
  }

  res.json({ success: true, request: responseRequest });
});

// @desc    Cancel a service request (customer only, before booking)
// @route   PUT /api/service-requests/:id/cancel
// @access  Private/Customer
const cancelServiceRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Service request not found');
  }
  if (String(request.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only cancel your own requests');
  }
  if (request.status === 'booked') {
    res.status(400);
    throw new Error('Cannot cancel a request that already has a confirmed booking');
  }

  request.status = 'cancelled';
  await request.save();
  res.json({ success: true, request });
});

module.exports = {
  classifyProblem,
  createServiceRequest,
  getMyServiceRequests,
  getOpenServiceRequestsForTechnician,
  getServiceRequestById,
  cancelServiceRequest,
};
