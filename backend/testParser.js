require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { fetchRecentReceipts } = require('./services/emailService');
const { getPlainTextBody, extractAmount, extractDate, extractServiceName } = require('./services/parserService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne();
  const messages = await fetchRecentReceipts(user._id);
  
  console.log(`Found ${messages.length} messages`);

  messages.forEach(msg => {
    const text = getPlainTextBody(msg);
    const fromHeader = msg.payload.headers.find(h=>h.name==='From').value;
    
    console.log('---');
    console.log('Service:', extractServiceName(fromHeader));
    console.log('Amount:', extractAmount(text));
    console.log('Date:', extractDate(text));
  });
  process.exit(0);
}

run();