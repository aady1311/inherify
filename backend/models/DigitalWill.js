const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const versionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  version: { type: Number, required: true },
  content: String,
  summary: String,
  updated_by: String,
  published: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, { _id: false });

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'My Digital Will' },
  content: String,
  status: { type: String, default: 'draft' },
  signed_at: Date,
  signature_hash: String,
  versions: { type: [versionSchema], default: [] },
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

schema.plugin(idPlugin);

module.exports = mongoose.model('DigitalWill', schema);
