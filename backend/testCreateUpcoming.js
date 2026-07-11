require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne();

  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  await Subscription.create({
    userId: user._id,
    serviceName: 'Netflix (test)',
    amount: 15.99,
    billingCycle: 'monthly',
    nextRenewalDate: twoDaysFromNow,
    status: 'active',
  });

  console.log('Test upcoming subscription created');
  process.exit(0);
}

run();