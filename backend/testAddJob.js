require('dotenv').config();
const renewalQueue = require('./queues/renewalQueue');

async function run() {
  await renewalQueue.add('checkRenewals', {});
  console.log('Job added to queue!');
  process.exit(0);
}

run();