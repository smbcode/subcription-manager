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

router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId }, // ensures users can only cancel their own
      { status: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;