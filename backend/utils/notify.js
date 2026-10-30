const { v4: uuid } = require('uuid');
const Notification = require('../models/Notification');

async function notify(userId, type, title, message) {
  try {
    await Notification.create({ id: uuid(), user_id: userId, type, title, message });
  } catch (err) {
    console.error('[NOTIFY] Failed to create notification', err);
  }
}

module.exports = notify;
