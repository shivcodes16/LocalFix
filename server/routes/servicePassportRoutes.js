const express = require('express');
const {
  createPassportItem,
  getMyPassportItems,
  getPassportItemById,
  updatePassportItem,
  deletePassportItem,
  addManualHistoryEntry,
} = require('../controllers/servicePassportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('customer'));

router.post('/', createPassportItem);
router.get('/', getMyPassportItems);
router.get('/:id', getPassportItemById);
router.put('/:id', updatePassportItem);
router.delete('/:id', deletePassportItem);
router.post('/:id/history', addManualHistoryEntry);

module.exports = router;
