const express = require('express');
const VaultAsset = require('../models/VaultAsset');
const VaultDocument = require('../models/VaultDocument');
const Nominee = require('../models/Nominee');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  const uid = req.user.id;
  const [totalAssets, totalDocuments, totalNominees, pendingNominees, storageAgg, user, sub,
    assetsByCategory, lastActivity, categoryAssets] = await Promise.all([
    VaultAsset.countDocuments({ user_id: uid }),
    VaultDocument.countDocuments({ user_id: uid }),
    Nominee.countDocuments({ user_id: uid }),
    Nominee.countDocuments({ user_id: uid, verification_status: 'pending' }),
    VaultDocument.aggregate([
      { $match: { user_id: uid } },
      { $group: { _id: null, storageUsed: { $sum: '$size' } } },
    ]),
    User.findOne({ id: uid }).select('last_login plan two_factor_enabled'),
    Subscription.findOne({ user_id: uid }),
    VaultAsset.aggregate([
      { $match: { user_id: uid } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    ActivityLog.findOne({ user_id: uid, type: 'login' }).sort({ timestamp: -1 }),
    VaultAsset.aggregate([
      { $match: { user_id: uid } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const pendingNomineeDoc = pendingNominees > 0
    ? await Nominee.findOne({ user_id: uid, verification_status: 'pending' }).select('name')
    : null;

  const storageByPlan = { free: 1_000_000_000, pro: 5_000_000_000, legacy: 50_000_000_000 };
  const plan = user?.plan || 'free';
  const storageTotal = storageByPlan[plan] || 5_000_000_000;

  // security score based on real data
  let score = 50;
  if (user?.two_factor_enabled) score += 20;
  if (totalNominees > 0) score += 15;
  if (totalAssets > 0) score += 10;
  if (totalDocuments > 0) score += 5;

  const renewsAt = sub?.renews_at ? new Date(sub.renews_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : null;

  res.json({
    totalAssets,
    totalDocuments,
    totalNominees,
    securityScore: Math.min(score, 100),
    lastLogin: user?.last_login,
    lastLoginDevice: lastActivity?.device || null,
    lastLoginLocation: lastActivity?.location || null,
    pendingVerifications: pendingNominees,
    pendingNomineeName: pendingNomineeDoc?.name || null,
    storageUsed: storageAgg[0]?.storageUsed || 0,
    storageTotal,
    subscriptionStatus: sub?.status || 'active',
    subscriptionPlan: plan,
    subscriptionRenewsAt: renewsAt,
    categoryData: assetsByCategory.map(c => ({ category: c._id, count: c.count })),
  });
});

// GET /api/dashboard/activity
router.get('/activity', async (req, res) => {
  const rows = await ActivityLog.find({ user_id: req.user.id }).sort({ timestamp: -1 }).limit(20);
  res.json(rows.map(r => ({
    id: r.id,
    type: r.type,
    description: r.description,
    ip: r.ip,
    device: r.device,
    location: r.location,
    timestamp: r.timestamp,
  })));
});

module.exports = router;
