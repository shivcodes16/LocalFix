const express = require('express');
const {
  getMyBookings,
  getBookingById,
  startJob,
  addServiceNote,
  markCompletedByTechnician,
  confirmCompletion,
  disputeBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/mine', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/start', protect, authorize('technician'), startJob);
router.post('/:id/notes', protect, authorize('technician'), upload.array('images', 4), addServiceNote);
router.put('/:id/complete', protect, authorize('technician'), markCompletedByTechnician);
router.put('/:id/confirm', protect, authorize('customer'), confirmCompletion);
router.put('/:id/dispute', protect, authorize('customer'), disputeBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
