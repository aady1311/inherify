const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  name: String,
  browser: String,
  os: String,
  ip: String,
  location: String,
  is_current: { type: Boolean, default: false },
  last_active: { type: Date, default: Date.now },
}, { strict: false });

schema.plugin(idPlugin);

module.exports = mongoose.model('UserDevice', schema);
