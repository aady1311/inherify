const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  name: String,
  type: { type: String, default: 'other' },
  size: { type: Number, default: 0 },
  category: { type: String, default: 'custom' },
  url: String,
  stored_filename: String,
  mime_type: { type: String, default: 'application/octet-stream' },
  encrypted: { type: Boolean, default: true },
  sharedWithNomineeIds: { type: [String], default: [] },
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: false } });

schema.plugin(idPlugin);

module.exports = mongoose.model('VaultDocument', schema);
