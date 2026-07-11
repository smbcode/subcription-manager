require('dotenv').config();
const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const connection = require('../config/redisConnection');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendRenewalAlert } = require('../services/mailerService');

mongoose.connect(process.env.MONGO_URI);

const worker = new Worker('renewalCheckQueue', async job => {
  console.log('Running renewal check job...');

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const upcoming = await Subscription.find({
    nextRenewalDate: { $lte: threeDaysFromNow, $gte: new Date() },
    status: 'active',
  });

  // Group subscriptions by user
  const byUser = {};
  upcoming.forEach(sub => {
    const uid = sub.userId.toString();
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push(sub);
  });

  for (const userId of Object.keys(byUser)) {
    const user = await User.findById(userId);
    if (user) {
      await sendRenewalAlert(user.email, byUser[userId]);
      console.log(`Sent alert to ${user.email}`);
    }
  }

  console.log(`Job done. Checked ${upcoming.length} upcoming renewals.`);
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

console.log('Renewal worker started, waiting for jobs...');