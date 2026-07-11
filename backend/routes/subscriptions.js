const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.userId }).sort({ nextRenewalDate: 1 });
    res.json(subscriptions);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

module.exports = router;