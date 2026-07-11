require('dotenv').config();
const { sendRenewalAlert } = require('./services/mailerService');

async function run() {
  await sendRenewalAlert('shaunak.bangale14@gmail.com', [
    { serviceName: 'Netflix', amount: 15.99, nextRenewalDate: new Date() },
    { serviceName: 'Spotify', amount: 9.99, nextRenewalDate: new Date() },
  ]);
  console.log('Email sent!');
}

run();