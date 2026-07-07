require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.create({
    googleId: 'test123',
    email: 'test@example.com',
  });

  const sub = await Subscription.create({
    userId: user._id,
    serviceName: 'Netflix',
    amount: 15.99,
    billingCycle: 'monthly',
    nextRenewalDate: new Date(),
  });

  console.log('Created:', sub);

  await User.deleteOne({ _id: user._id });
  await Subscription.deleteOne({ _id: sub._id });
  console.log('Cleaned up test data');

  process.exit(0);
}

run();