const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  type: String,
  status: { type: String, default: 'pending' },
}, { timestamps: { createdAt: 'submitted_at', updatedAt: false }, strict: false });

schema.plugin(idPlugin);

module.exports = mongoose.model('VerificationRequest', schema);
