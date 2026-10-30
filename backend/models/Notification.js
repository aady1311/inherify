const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  type: String,
  title: String,
  message: String,
  is_read: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, strict: false });

schema.plugin(idPlugin);

module.exports = mongoose.model('Notification', schema);
