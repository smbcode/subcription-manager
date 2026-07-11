const { google } = require('googleapis');
const crypto = require('crypto');
const User = require('../models/User');

function decrypt(encryptedText) {
  const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
  const [ivHex, dataHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

async function getGmailClient(userId) {
  const user = await User.findById(userId);
  if (!user || !user.encryptedRefreshToken) {
    throw new Error('User has no stored refresh token');
  }

  const refreshToken = decrypt(user.encryptedRefreshToken);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}
async function fetchRecentReceipts(userId) {
  const gmail = await getGmailClient(userId);

  const searchResponse = await gmail.users.messages.list({
    userId: 'me',
    q: `subject:(receipt OR invoice OR subscription OR renewal OR payment OR billing) -subject:"Upcoming subscription renewals" newer_than:90d`,    maxResults: 20,
  });

  const messages = searchResponse.data.messages || [];
  const results = [];

  for (const msg of messages) {
    try {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });
      results.push(fullMessage.data);
    } catch (err) {
      console.error(`Failed to fetch message ${msg.id}:`, err.message);
    }
  }

  return results;
}

module.exports = { getGmailClient, fetchRecentReceipts };
