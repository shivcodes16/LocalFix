const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { uploadImageBuffer } = require('../utils/imageUpload');

// @desc    Update own profile (name, phone, location)
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address, city, lat, lng } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address !== undefined) user.location.address = address;
  if (city !== undefined) user.location.city = city;
  if (lat !== undefined && lng !== undefined) {
    user.location.coordinates = [Number(lng), Number(lat)];
  }

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Upload/replace own avatar
// @route   POST /api/users/me/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const url = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'localfix/avatars');

  const user = await User.findById(req.user._id);
  user.avatarUrl = url;
  await user.save();

  res.json({ success: true, avatarUrl: url });
});

// @desc    Get a public user snapshot by id (limited fields)
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name avatarUrl role createdAt');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

module.exports = { updateMe, uploadAvatar, getUserById };
