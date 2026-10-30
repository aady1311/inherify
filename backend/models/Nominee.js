const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  name: String,
  email: String,
  phone: { type: String, default: '' },
  relation: { type: String, default: 'Family' },
  share_percentage: { type: Number, default: 0 },
  verification_status: { type: String, default: 'pending' },
  verification_token: String,
  verification_expires_at: Date,
}, { timestamps: { createdAt: 'added_at', updatedAt: false } });

schema.plugin(idPlugin);

module.exports = mongoose.model('Nominee', schema);
