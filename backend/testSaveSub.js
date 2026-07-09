require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { fetchRecentReceipts } = require('./services/emailService');
const { saveSubscriptionFromEmail } = require('./services/parserService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne();
  const messages = await fetchRecentReceipts(user._id);

  console.log(`Processing ${messages.length} messages...`);

  for (const msg of messages) {
    const sub = await saveSubscriptionFromEmail(user._id, msg);
    console.log(`Saved: ${sub.serviceName} | status: ${sub.status}`);
  }

  process.exit(0);
}

run();