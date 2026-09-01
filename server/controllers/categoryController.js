const asyncHandler = require('express-async-handler');
const ServiceCategory = require('../models/ServiceCategory');
const ensureDefaultCategories = require('../utils/ensureDefaultCategories');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  let categories = await ServiceCategory.find({ isActive: true }).sort('name');

  // Self-healing fallback: if the collection is empty for any reason (the
  // startup bootstrap didn't run, failed, or the collection was cleared),
  // create the default categories right now and re-query, instead of
  // returning an empty list to the frontend.
  if (categories.length === 0) {
    console.warn('[LocalFix] GET /api/categories found zero categories — running self-heal bootstrap now.');
    try {
      await ensureDefaultCategories();
      categories = await ServiceCategory.find({ isActive: true }).sort('name');
    } catch (error) {
      console.error('[LocalFix] Self-heal bootstrap in GET /api/categories failed:', error.stack || error.message);
      // Fall through and return whatever we have (possibly still empty)
      // rather than failing the request entirely.
    }
  }

  res.json({ success: true, categories });
});

// @desc    Create a category (admin only)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, subcategories } = req.body;
  const category = await ServiceCategory.create({ name, description, icon, subcategories });
  res.status(201).json({ success: true, category });
});

// @desc    Update a category (admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  Object.assign(category, req.body);
  await category.save();
  res.json({ success: true, category });
});

module.exports = { getCategories, createCategory, updateCategory };
