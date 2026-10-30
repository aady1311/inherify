const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  name: String,
  email: String,
  phone: String,
  relation: String,
  priority: { type: Number, default: 1 },
});

schema.plugin(idPlugin);

module.exports = mongoose.model('EmergencyContact', schema);
