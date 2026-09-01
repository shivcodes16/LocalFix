const express = require('express');
const {
  classifyProblem,
  createServiceRequest,
  getMyServiceRequests,
  getOpenServiceRequestsForTechnician,
  getServiceRequestById,
  cancelServiceRequest,
} = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/classify', protect, authorize('customer'), classifyProblem);
router.post('/', protect, authorize('customer'), upload.array('images', 6), createServiceRequest);
router.get('/mine', protect, authorize('customer'), getMyServiceRequests);
router.get('/open', protect, authorize('technician'), getOpenServiceRequestsForTechnician);
router.get('/:id', protect, getServiceRequestById);
router.put('/:id/cancel', protect, authorize('customer'), cancelServiceRequest);

module.exports = router;
