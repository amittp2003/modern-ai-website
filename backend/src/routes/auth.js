const express = require('express');
const router = express.Router();
const {
  register,
  login,
  protect,
  authorize,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Protected routes example
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// Admin only route example
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted',
  });
});

module.exports = router;