require('dotenv').config();
const renewalQueue = require('./queues/renewalQueue');

async function run() {
  await renewalQueue.add(
    'dailyRenewalCheck',
    {},
    {
      repeat: { pattern: '0 9 * * *' }, //at 9:00 AM
      jobId: 'daily-renewal-check',
    }
  );
  console.log('Daily schedule registered');
  process.exit(0);
}

run();