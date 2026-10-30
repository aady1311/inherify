const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function present(row) {
  const obj = row.toJSON();
  return {
    id: obj.id,
    type: obj.type,
    title: obj.title,
    message: obj.message,
    read: !!obj.is_read,
    createdAt: obj.created_at,
    actionUrl: obj.action_url,
  };
}

// GET /api/notifications
router.get('/', async (req, res) => {
  const { type } = req.query;
  const filter = { user_id: req.user.id };
  if (type && type !== 'all') filter.type = type;
  const rows = await Notification.find(filter).sort({ created_at: -1 });
  res.json(rows.map(present));
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  await Notification.findOneAndUpdate({ id: req.params.id, user_id: req.user.id }, { is_read: true });
  res.json({ id: req.params.id, read: true });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  await Notification.updateMany({ user_id: req.user.id }, { is_read: true });
  res.json({ success: true });
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  await Notification.deleteOne({ id: req.params.id, user_id: req.user.id });
  res.json({ id: req.params.id });
});

module.exports = router;
