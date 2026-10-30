const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  plan: { type: String, default: 'free' },
  status: { type: String, default: 'active' },
  renews_at: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
});

schema.plugin(idPlugin);

module.exports = mongoose.model('Subscription', schema);
