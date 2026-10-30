const express = require('express');
const User = require('../models/User');
const VaultAsset = require('../models/VaultAsset');
const VerificationRequest = require('../models/VerificationRequest');
const ActivityLog = require('../models/ActivityLog');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(auth, adminOnly);

const SAFE_FIELDS = 'id name email phone avatar role status plan two_factor_enabled joined_at last_login';

function normalizeUser(u) {
  const obj = typeof u.toJSON === 'function' ? u.toJSON() : u;
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
  };
}

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const rows = await User.find({}).select(SAFE_FIELDS).sort({ joined_at: -1 });
  res.json(rows.map(normalizeUser));
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', async (req, res) => {
  const { status } = req.body;
  await User.findOneAndUpdate({ id: req.params.id }, { status });
  res.json({ id: req.params.id, status });
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  await User.findOneAndUpdate({ id: req.params.id }, { role });
  console.log(`[ADMIN] Role updated — User: ${req.params.id} | New role: ${role} | By: ${req.user.email}`);
  res.json({ id: req.params.id, role });
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  const rows = await VerificationRequest.find({}).sort({ submitted_at: -1 });
  const userIds = [...new Set(rows.map(r => r.user_id))];
  const users = await User.find({ id: { $in: userIds } }).select('id name');
  const nameById = new Map(users.map(u => [u.id, u.name]));
  const reports = rows.map(r => ({
    id: r.id,
    type: r.type === 'death-certificate' ? 'verification' : r.type === 'identity' ? 'user' : 'verification',
    title: `${r.type.replace('-', ' ')} — ${nameById.get(r.user_id) || 'Unknown'}`,
    status: r.status === 'verified' ? 'resolved' : r.status === 'rejected' ? 'resolved' : r.status === 'reviewing' ? 'reviewing' : 'open',
    createdAt: r.submitted_at,
    priority: r.type === 'death-certificate' ? 'high' : r.type === 'legal' ? 'medium' : 'low',
    assignee: r.status === 'reviewing' ? 'Verification Team' : undefined,
  }));
  res.json(reports);
});

// PATCH /api/admin/reports/:id/resolve
router.patch('/reports/:id/resolve', async (req, res) => {
  await VerificationRequest.findOneAndUpdate({ id: req.params.id }, { status: 'verified' });
  res.json({ id: req.params.id, status: 'resolved' });
});

// GET /api/admin/verifications
router.get('/verifications', async (req, res) => {
  const rows = await VerificationRequest.find({}).sort({ submitted_at: -1 });
  const userIds = [...new Set(rows.map(r => r.user_id))];
  const users = await User.find({ id: { $in: userIds } }).select('id name');
  const nameById = new Map(users.map(u => [u.id, u.name]));
  res.json(rows.map(r => {
    const obj = r.toJSON();
    obj.user_name = nameById.get(r.user_id) || null;
    return obj;
  }));
});

// PATCH /api/admin/verifications/:id/approve
router.patch('/verifications/:id/approve', async (req, res) => {
  await VerificationRequest.findOneAndUpdate({ id: req.params.id }, { status: 'verified' });
  res.json({ id: req.params.id, status: 'verified' });
});

// PATCH /api/admin/verifications/:id/reject
router.patch('/verifications/:id/reject', async (req, res) => {
  await VerificationRequest.findOneAndUpdate({ id: req.params.id }, { status: 'rejected' });
  res.json({ id: req.params.id, status: 'rejected' });
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  const now = new Date();
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en', { month: 'short' }) };
  });

  const [totalUsers, activeUsers, totalAssets, pendingVerifications, proCount, legacyCount, freeCount, growthData] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: 'active' }),
    VaultAsset.countDocuments({}),
    VerificationRequest.countDocuments({ status: 'pending' }),
    User.countDocuments({ plan: 'pro' }),
    User.countDocuments({ plan: 'legacy' }),
    User.countDocuments({ plan: 'free' }),
    Promise.all(months.map(async ({ year, month, label }) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);
      const [users, paying] = await Promise.all([
        User.countDocuments({ joined_at: { $lt: end } }),
        User.countDocuments({ joined_at: { $lt: end }, plan: { $in: ['pro', 'legacy'] } }),
      ]);
      return { month: label, users, paying };
    })),
  ]);

  res.json({
    totalUsers,
    activeUsers,
    totalAssets,
    pendingVerifications,
    revenue: (proCount * 19) + (legacyCount * 49),
    conversionRate: totalUsers > 0 ? (((proCount + legacyCount) / totalUsers) * 100).toFixed(1) : 0,
    planDistribution: [
      { name: 'Free', value: freeCount, color: '#94a3b8' },
      { name: 'Pro', value: proCount, color: '#4F46E5' },
      { name: 'Legacy', value: legacyCount, color: '#06B6D4' },
    ],
    userGrowth: growthData,
  });
});

module.exports = router;
