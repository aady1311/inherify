const { v4: uuid } = require('uuid');
const ActivityLog = require('../models/ActivityLog');

async function logActivity(req, type, description) {
  try {
    await ActivityLog.create({
      id: uuid(),
      user_id: req.user.id,
      type,
      description,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      device: req.headers['user-agent'] || '',
      location: '',
    });
  } catch (err) {
    console.error('[ACTIVITY] Failed to log activity', err);
  }
}

module.exports = logActivity;
