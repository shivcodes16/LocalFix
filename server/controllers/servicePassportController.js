const asyncHandler = require('express-async-handler');
const ServicePassportItem = require('../models/ServicePassportItem');

// @desc    Create a new tracked product/appliance
// @route   POST /api/service-passport
// @access  Private/Customer
const createPassportItem = asyncHandler(async (req, res) => {
  const { productName, category, brand, purchaseDate, notes } = req.body;

  if (!productName) {
    res.status(400);
    throw new Error('Product name is required');
  }

  const item = await ServicePassportItem.create({
    customer: req.user._id,
    productName,
    category,
    brand,
    purchaseDate,
    notes,
  });

  res.status(201).json({ success: true, item });
});

// @desc    Get all of my tracked products with full history
// @route   GET /api/service-passport
// @access  Private/Customer
const getMyPassportItems = asyncHandler(async (req, res) => {
  const items = await ServicePassportItem.find({ customer: req.user._id })
    .populate('category', 'name icon')
    .populate('history.technician', 'name avatarUrl')
    .sort('-createdAt');

  res.json({ success: true, items });
});

// @desc    Get a single passport item (owner only)
// @route   GET /api/service-passport/:id
// @access  Private/Customer
const getPassportItemById = asyncHandler(async (req, res) => {
  const item = await ServicePassportItem.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('history.technician', 'name avatarUrl');

  if (!item) {
    res.status(404);
    throw new Error('Service passport item not found');
  }
  if (String(item.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only view your own service passport items');
  }

  res.json({ success: true, item });
});

// @desc    Update a passport item's basic details
// @route   PUT /api/service-passport/:id
// @access  Private/Customer
const updatePassportItem = asyncHandler(async (req, res) => {
  const item = await ServicePassportItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Service passport item not found');
  }
  if (String(item.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own service passport items');
  }

  const { productName, brand, purchaseDate, notes, category } = req.body;
  if (productName !== undefined) item.productName = productName;
  if (brand !== undefined) item.brand = brand;
  if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
  if (notes !== undefined) item.notes = notes;
  if (category !== undefined) item.category = category;

  await item.save();
  res.json({ success: true, item });
});

// @desc    Delete a passport item
// @route   DELETE /api/service-passport/:id
// @access  Private/Customer
const deletePassportItem = asyncHandler(async (req, res) => {
  const item = await ServicePassportItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Service passport item not found');
  }
  if (String(item.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own service passport items');
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Service passport item deleted' });
});

// @desc    Manually add a history entry (e.g. for offline/off-platform service)
// @route   POST /api/service-passport/:id/history
// @access  Private/Customer
const addManualHistoryEntry = asyncHandler(async (req, res) => {
  const { serviceType, date, cost, notes, warrantyExpiresAt } = req.body;

  if (!serviceType) {
    res.status(400);
    throw new Error('Service type is required');
  }

  const item = await ServicePassportItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Service passport item not found');
  }
  if (String(item.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own service passport items');
  }

  item.history.push({ serviceType, date, cost, notes, warrantyExpiresAt });
  await item.save();

  res.status(201).json({ success: true, item });
});

module.exports = {
  createPassportItem,
  getMyPassportItems,
  getPassportItemById,
  updatePassportItem,
  deletePassportItem,
  addManualHistoryEntry,
};
