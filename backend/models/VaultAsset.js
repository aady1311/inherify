const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  title: String,
  category: String,
  username: String,
  url: String,
  notes: String,
  status: { type: String, default: 'active' },
  favorite: { type: Boolean, default: false },
  encrypted: { type: Boolean, default: true },
  sharedWithNomineeIds: { type: [String], default: [] },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

schema.plugin(idPlugin);

module.exports = mongoose.model('VaultAsset', schema);
