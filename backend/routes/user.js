const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('email');
    res.json({ email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;