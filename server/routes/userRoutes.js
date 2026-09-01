const express = require('express');
const { updateMe, uploadAvatar, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.put('/me', protect, updateMe);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id', protect, getUserById);

module.exports = router;
