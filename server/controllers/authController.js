const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const TechnicianProfile = require('../models/TechnicianProfile');
const generateToken = require('../utils/generateToken');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: (Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
});

// @desc    Register a new user (customer or technician)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  const allowedRole = role === 'technician' ? 'technician' : 'customer';

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: allowedRole,
  });

  // Technicians get an empty profile shell immediately so they can fill it in.
  if (allowedRole === 'technician') {
    await TechnicianProfile.create({ user: user._id });
  }

  const token = generateToken(user._id, user.role);
  res.cookie('token', token, cookieOptions());

  res.status(201).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);
  res.cookie('token', token, cookieOptions());

  res.json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Get logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Logout (clears cookie; client should also drop stored token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, getMe, logout };
