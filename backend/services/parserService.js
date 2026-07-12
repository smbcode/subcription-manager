function getPlainTextBody(message) {
  const parts = message.payload.parts || [message.payload];

  const plainPart = parts.find(p => p.mimeType === 'text/plain');
  const target = plainPart || parts[0]; // fallback

  if (!target || !target.body || !target.body.data) return '';

  const buff = Buffer.from(target.body.data, 'base64');
  return buff.toString('utf-8');
}
function extractAmount(text) {
  const match = text.match(/\$\s?\d{1,3}(,\d{3})*(\.\d{2})?/);
  return match ? parseFloat(match[0].replace(/[$,\s]/g, '')) : null;
}

function extractDate(text) {
  const patterns = [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,      
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[0]);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function extractServiceName(fromHeader) {
  const domainMatch = fromHeader.match(/@([\w.-]+)\./);
  if (domainMatch) {
    return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
  }
  const nameMatch = fromHeader.match(/^"?([^"<]+)"?\s*</);
  return nameMatch ? nameMatch[1].trim() : 'Unknown';
}

const Subscription = require('../models/Subscription');

async function saveSubscriptionFromEmail(userId, message) {
  const text = getPlainTextBody(message);
  const fromHeader = message.payload.headers.find(h => h.name === 'From').value;

  const serviceName = extractServiceName(fromHeader);
  const amount = extractAmount(text);
  const nextRenewalDate = extractDate(text);

  const existingByEmail = await Subscription.findOne({ sourceEmailId: message.id });
  if (existingByEmail) return existingByEmail;
  const existingByService = await Subscription.findOne({ userId, serviceName });

  if (existingByService) {
    existingByService.amount = amount || existingByService.amount;
    existingByService.nextRenewalDate = nextRenewalDate || existingByService.nextRenewalDate;
    existingByService.sourceEmailId = message.id;
    existingByService.status = (amount && nextRenewalDate) ? 'active' : existingByService.status;
    await existingByService.save();
    return existingByService;
  }

  const status = (amount && nextRenewalDate) ? 'active' : 'needs_review';

  return await Subscription.create({
    userId,
    serviceName,
    amount,
    nextRenewalDate,
    sourceEmailId: message.id,
    status,
  });
}

module.exports = { getPlainTextBody, extractAmount, extractDate, extractServiceName, saveSubscriptionFromEmail };