const asyncHandler = require('express-async-handler');
const TechnicianProfile = require('../models/TechnicianProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const { uploadMultipleImages } = require('../utils/imageUpload');
const { distanceKm } = require('../utils/geoUtils');

// @desc    Get/create my technician profile
// @route   GET /api/technicians/me
// @access  Private/Technician
const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await TechnicianProfile.findOne({ user: req.user._id }).populate('categories');
  if (!profile) {
    profile = await TechnicianProfile.create({ user: req.user._id });
  }
  res.json({ success: true, profile, user: req.user.toSafeObject() });
});

// @desc    Update my technician profile
// @route   PUT /api/technicians/me
// @access  Private/Technician
const updateMyProfile = asyncHandler(async (req, res) => {
  const {
    headline,
    bio,
    categories,
    subcategories,
    yearsOfExperience,
    pricing,
    serviceAreas,
    serviceRadiusKm,
    availability,
    isAcceptingRequests,
  } = req.body;

  let profile = await TechnicianProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = new TechnicianProfile({ user: req.user._id });
  }

  if (headline !== undefined) profile.headline = headline;
  if (bio !== undefined) profile.bio = bio;
  if (categories !== undefined) profile.categories = categories;
  if (subcategories !== undefined) profile.subcategories = subcategories;
  if (yearsOfExperience !== undefined) profile.yearsOfExperience = yearsOfExperience;
  if (pricing !== undefined) profile.pricing = { ...profile.pricing.toObject(), ...pricing };
  if (serviceAreas !== undefined) profile.serviceAreas = serviceAreas;
  if (serviceRadiusKm !== undefined) profile.serviceRadiusKm = serviceRadiusKm;
  if (availability !== undefined) profile.availability = availability;
  if (isAcceptingRequests !== undefined) profile.isAcceptingRequests = isAcceptingRequests;

  await profile.save();
  res.json({ success: true, profile });
});

// @desc    Upload work images to my technician profile
// @route   POST /api/technicians/me/work-images
// @access  Private/Technician
const uploadWorkImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No image files provided');
  }

  const urls = await uploadMultipleImages(req.files, 'localfix/work-images');

  const profile = await TechnicianProfile.findOne({ user: req.user._id });
  profile.workImages.push(...urls);
  await profile.save();

  res.json({ success: true, workImages: profile.workImages });
});

// @desc    Search/discover technicians with filters
// @route   GET /api/technicians
// @access  Public
// Query params: category, lat, lng, maxDistanceKm, minRating, minPrice, maxPrice,
// verifiedOnly, availableOnly, page, limit
const searchTechnicians = asyncHandler(async (req, res) => {
  const {
    category,
    lat,
    lng,
    maxDistanceKm = 25,
    minRating,
    minPrice,
    maxPrice,
    verifiedOnly,
    availableOnly,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (category) filter.categories = category;
  if (minRating) filter['stats.averageRating'] = { $gte: Number(minRating) };
  if (verifiedOnly === 'true') filter['stats.verifiedJobs'] = { $gt: 0 };
  if (availableOnly === 'true') filter.isAcceptingRequests = true;
  if (minPrice || maxPrice) {
    filter['pricing.minPrice'] = {};
    if (minPrice) filter['pricing.minPrice'].$gte = Number(minPrice);
    if (maxPrice) filter['pricing.maxPrice'] = { $lte: Number(maxPrice) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const profiles = await TechnicianProfile.find(filter)
    .populate('categories', 'name slug icon')
    .populate({ path: 'user', select: 'name avatarUrl location isActive' })
    .sort({ 'stats.verifiedJobs': -1, 'stats.averageRating': -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await TechnicianProfile.countDocuments(filter);

  // Geolocation filter/sort: applied in-memory using haversine as a graceful
  // fallback that works with or without a Google Maps API key.
  let results = profiles
    .filter((p) => p.user && p.user.isActive)
    .map((p) => {
      const obj = p.toObject();
      if (lat && lng && p.user.location?.coordinates?.some((c) => c !== 0)) {
        obj.distanceKm = distanceKm(
          [Number(lng), Number(lat)],
          p.user.location.coordinates
        );
      } else {
        obj.distanceKm = null;
      }
      return obj;
    });

  if (lat && lng) {
    results = results.filter((p) => p.distanceKm === null || p.distanceKm <= Number(maxDistanceKm));
    results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  res.json({
    success: true,
    count: results.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    technicians: results,
  });
});

// @desc    Get a single technician's public profile (with reviews)
// @route   GET /api/technicians/:userId
// @access  Public
const getTechnicianPublicProfile = asyncHandler(async (req, res) => {
  const profile = await TechnicianProfile.findOne({ user: req.params.userId })
    .populate('categories', 'name slug icon')
    .populate({ path: 'user', select: 'name avatarUrl location createdAt' });

  if (!profile) {
    res.status(404);
    throw new Error('Technician profile not found');
  }

  const reviews = await Review.find({ technician: req.params.userId })
    .populate('customer', 'name avatarUrl')
    .sort('-createdAt')
    .limit(20);

  res.json({ success: true, profile, reviews });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadWorkImages,
  searchTechnicians,
  getTechnicianPublicProfile,
};
