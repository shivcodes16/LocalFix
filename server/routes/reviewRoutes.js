const express = require('express');
const { createReview, getTechnicianReviews, replyToReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('customer'), createReview);
router.get('/technician/:userId', getTechnicianReviews);
router.put('/:id/reply', protect, authorize('technician'), replyToReview);

module.exports = router;
