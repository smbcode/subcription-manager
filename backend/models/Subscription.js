const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceName: { type: String, required: true },
  amount: { type: Number },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'weekly', 'unknown'], default: 'unknown' },
  nextRenewalDate: { type: Date },
  sourceEmailId: { type: String },
  status: { type: String, enum: ['active', 'needs_review', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);