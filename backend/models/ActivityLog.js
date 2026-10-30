const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  type: String,
  description: String,
  ip: String,
  device: String,
  location: String,
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

schema.plugin(idPlugin);

module.exports = mongoose.model('ActivityLog', schema);
