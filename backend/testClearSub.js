require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Subscription.deleteMany({});
  console.log(`Deleted ${result.deletedCount} subscriptions`);
  process.exit(0);
}

run();