require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { fetchRecentReceipts } = require('./services/emailService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne(); // grabs the one user you created via OAuth login
  if (!user) {
    console.log('No user found — log in via /auth/google first');
    process.exit(1);
  }

  const messages = await fetchRecentReceipts(user._id);
  console.log(`Found ${messages.length} messages`);

  // Just print the subject line of each, using the headers array
  messages.forEach(msg => {
    const subjectHeader = msg.payload.headers.find(h => h.name === 'Subject');
    console.log('-', subjectHeader ? subjectHeader.value : '(no subject)');
  });
  //console.log(JSON.stringify(messages[0].payload, null, 2));
  process.exit(0);
}

run();