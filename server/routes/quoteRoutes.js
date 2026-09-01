const express = require('express');
const { submitQuote, getQuotesForRequest, getMyQuotes, acceptQuote } = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('technician'), submitQuote);
router.get('/mine', protect, authorize('technician'), getMyQuotes);
router.get('/request/:serviceRequestId', protect, authorize('customer'), getQuotesForRequest);
router.put('/:id/accept', protect, authorize('customer'), acceptQuote);

module.exports = router;
