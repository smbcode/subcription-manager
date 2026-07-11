const { Queue } = require('bullmq');
const connection = require('../config/redisConnection');

const renewalQueue = new Queue('renewalCheckQueue', { connection });

module.exports = renewalQueue;