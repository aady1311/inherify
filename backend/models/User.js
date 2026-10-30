const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password_hash: String,
  phone: String,
  avatar: String,
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  plan: { type: String, default: 'free' },
  two_factor_enabled: { type: Boolean, default: false },
  otp_code: String,
  otp_expires_at: Date,
  last_login: Date,
  preferences: {
    email_notifications: { type: Boolean, default: true },
    push_notifications: { type: Boolean, default: true },
    security_alerts: { type: Boolean, default: true },
    marketing_updates: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    public_profile: { type: Boolean, default: false },
  },
}, { timestamps: { createdAt: 'joined_at', updatedAt: false } });

schema.plugin(idPlugin);

module.exports = mongoose.model('User', schema);
