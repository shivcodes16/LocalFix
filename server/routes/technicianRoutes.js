const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  uploadWorkImages,
  searchTechnicians,
  getTechnicianPublicProfile,
} = require('../controllers/technicianController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Specific routes before the dynamic /:userId route.
router.get('/me', protect, authorize('technician'), getMyProfile);
router.put('/me', protect, authorize('technician'), updateMyProfile);
router.post(
  '/me/work-images',
  protect,
  authorize('technician'),
  upload.array('images', 6),
  uploadWorkImages
);

router.get('/', searchTechnicians);
router.get('/:userId', getTechnicianPublicProfile);

module.exports = router;
