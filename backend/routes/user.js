const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const User = require('../models/User');
const UserDevice = require('../models/UserDevice');
const EmergencyContact = require('../models/EmergencyContact');
const Subscription = require('../models/Subscription');
const notify = require('../utils/notify');
const logActivity = require('../utils/logActivity');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

const SAFE_FIELDS = 'id name email phone avatar role status plan two_factor_enabled joined_at last_login preferences';

function normalizeUser(u) {
  const obj = u.toJSON();
  const prefs = obj.preferences || {};
  return {
    id: obj.id,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    avatar: obj.avatar,
    role: obj.role ?? 'user',
    status: obj.status ?? 'active',
    plan: obj.plan ?? 'free',
    twoFactorEnabled: obj.two_factor_enabled ?? false,
    joinedAt: obj.joined_at,
    lastLogin: obj.last_login,
    preferences: {
      emailNotifications: prefs.email_notifications ?? true,
      pushNotifications: prefs.push_notifications ?? true,
      securityAlerts: prefs.security_alerts ?? true,
      marketingUpdates: prefs.marketing_updates ?? false,
      analytics: prefs.analytics ?? true,
      publicProfile: prefs.public_profile ?? false,
    },
  };
}

function presentDevice(row) {
  const obj = row.toJSON();
  return {
    id: obj.id,
    name: obj.name,
    location: obj.location,
    lastActive: obj.last_active,
    current: !!obj.is_current,
  };
}

// GET /api/user/me
router.get('/me', async (req, res) => {
  const user = await User.findOne({ id: req.user.id }).select(SAFE_FIELDS);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(normalizeUser(user));
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  const { name, phone, avatar } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (avatar !== undefined) update.avatar = avatar;
  const user = await User.findOneAndUpdate({ id: req.user.id }, update, { new: true }).select(SAFE_FIELDS);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await logActivity(req, 'update', 'Updated profile');
  res.json(normalizeUser(user));
});

// PUT /api/user/password
router.put('/password', async (req, res) => {
  const { current, next } = req.body;
  const user = await User.findOne({ id: req.user.id }).select('id password_hash');
  const ok = await bcrypt.compare(current, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Current password incorrect' });
  user.password_hash = await bcrypt.hash(next, 10);
  await user.save();
  await notify(req.user.id, 'security', 'Password changed', 'Your account password was updated.');
  await logActivity(req, 'update', 'Changed password');
  res.json({ success: true });
});

// PATCH /api/user/2fa
router.patch('/2fa', async (req, res) => {
  const { enabled } = req.body;
  await User.findOneAndUpdate({ id: req.user.id }, { two_factor_enabled: !!enabled });
  await notify(req.user.id, 'security', enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled', enabled ? 'Your account now requires 2FA to sign in.' : '2FA was turned off for your account.');
  await logActivity(req, 'update', enabled ? 'Enabled two-factor authentication' : 'Disabled two-factor authentication');
  res.json({ enabled: !!enabled });
});

// PATCH /api/user/preferences
router.patch('/preferences', async (req, res) => {
  const { emailNotifications, pushNotifications, securityAlerts, marketingUpdates, analytics, publicProfile } = req.body;
  const update = {};
  if (emailNotifications !== undefined) update['preferences.email_notifications'] = !!emailNotifications;
  if (pushNotifications !== undefined) update['preferences.push_notifications'] = !!pushNotifications;
  if (securityAlerts !== undefined) update['preferences.security_alerts'] = !!securityAlerts;
  if (marketingUpdates !== undefined) update['preferences.marketing_updates'] = !!marketingUpdates;
  if (analytics !== undefined) update['preferences.analytics'] = !!analytics;
  if (publicProfile !== undefined) update['preferences.public_profile'] = !!publicProfile;
  const user = await User.findOneAndUpdate({ id: req.user.id }, { $set: update }, { new: true }).select(SAFE_FIELDS);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(normalizeUser(user));
});

// POST /api/user/avatar
router.post('/avatar', avatarUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'File must be an image' });
  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const user = await User.findOneAndUpdate({ id: req.user.id }, { avatar: dataUri }, { new: true }).select(SAFE_FIELDS);
  await logActivity(req, 'update', 'Updated profile photo');
  res.json(normalizeUser(user));
});

// DELETE /api/user/account
router.delete('/account', async (req, res) => {
  await User.deleteOne({ id: req.user.id });
  res.json({ success: true });
});

// GET /api/user/devices
router.get('/devices', async (req, res) => {
  const rows = await UserDevice.find({ user_id: req.user.id }).sort({ last_active: -1 });
  res.json(rows.map(presentDevice));
});

// DELETE /api/user/devices/:id
router.delete('/devices/:id', async (req, res) => {
  await UserDevice.deleteOne({ id: req.params.id, user_id: req.user.id });
  res.json({ id: req.params.id, revoked: true });
});

// GET /api/user/emergency-contacts
router.get('/emergency-contacts', async (req, res) => {
  const rows = await EmergencyContact.find({ user_id: req.user.id }).sort({ priority: 1 });
  res.json(rows);
});

// POST /api/user/emergency-contacts
router.post('/emergency-contacts', async (req, res) => {
  const { name, email, phone, relation, priority } = req.body;
  const row = await EmergencyContact.create({
    id: uuid(), user_id: req.user.id, name, email, phone, relation, priority: priority || 1,
  });
  res.status(201).json(row);
});

// PUT /api/user/emergency-contacts/:id
router.put('/emergency-contacts/:id', async (req, res) => {
  const { name, email, phone, relation, priority } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  if (relation !== undefined) update.relation = relation;
  if (priority !== undefined) update.priority = priority;
  const row = await EmergencyContact.findOneAndUpdate(
    { id: req.params.id, user_id: req.user.id },
    update,
    { new: true }
  );
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// DELETE /api/user/emergency-contacts/:id
router.delete('/emergency-contacts/:id', async (req, res) => {
  await EmergencyContact.deleteOne({ id: req.params.id, user_id: req.user.id });
  res.json({ id: req.params.id });
});

function normalizeSubscription(s) {
  const obj = s.toJSON();
  return {
    id: obj.id,
    plan: obj.plan ?? 'free',
    status: obj.status ?? 'active',
    renewsAt: obj.renews_at,
  };
}

const VALID_PLANS = ['free', 'pro', 'legacy'];

// GET /api/user/subscription
router.get('/subscription', async (req, res) => {
  const sub = await Subscription.findOne({ user_id: req.user.id });
  res.json(sub ? normalizeSubscription(sub) : null);
});

// PATCH /api/user/subscription — simulated checkout: no real payment gateway is
// wired up, this just persists the plan the fake payment flow "accepted".
router.patch('/subscription', async (req, res) => {
  const { plan } = req.body;
  if (!VALID_PLANS.includes(plan)) return res.status(400).json({ error: 'Invalid plan' });

  await User.findOneAndUpdate({ id: req.user.id }, { plan });
  const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  let sub = await Subscription.findOne({ user_id: req.user.id });
  if (!sub) {
    sub = await Subscription.create({ id: uuid(), user_id: req.user.id, plan, status: 'active', renews_at: renewsAt });
  } else {
    sub.plan = plan;
    sub.status = 'active';
    sub.renews_at = renewsAt;
    await sub.save();
  }
  await notify(req.user.id, 'billing', 'Plan updated', `You're now on the ${plan} plan.`);
  await logActivity(req, 'update', `Switched to the ${plan} plan`);
  res.json(normalizeSubscription(sub));
});

module.exports = router;
