const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendRenewalAlert(toEmail, subscriptions) {
  const listHtml = subscriptions
    .map(s => `<li>${s.serviceName} — $${s.amount} renews on ${s.nextRenewalDate.toDateString()}</li>`)
    .join('');

  await transporter.sendMail({
    from: `"Subscription Manager" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Upcoming subscription renewals',
    html: `<p>Here are your subscriptions renewing soon:</p><ul>${listHtml}</ul>`,
  });
}

module.exports = { sendRenewalAlert };