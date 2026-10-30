const express = require('express');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const Nominee = require('../models/Nominee');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const transporter = require('../utils/mailer');
const notify = require('../utils/notify');
const logActivity = require('../utils/logActivity');
const { auth } = require('../middleware/auth');

const router = express.Router();

function present(row) {
  const obj = row.toJSON();
  return {
    id: obj.id,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    relation: obj.relation,
    sharePercentage: obj.share_percentage ?? 0,
    verificationStatus: obj.verification_status ?? 'pending',
    addedAt: obj.added_at,
    assetsShared: 0,
  };
}

function verifyPage(title, message, ok) {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0b0b12; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { max-width: 420px; padding: 32px; border-radius: 16px; border: 1px solid #27272a; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 8px; color: ${ok ? '#34d399' : '#fb7185'}; }
  p { color: #a1a1aa; font-size: 14px; margin: 0; }
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

async function sendVerificationEmail(nominee, ownerName) {
  const link = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`}/api/nominees/verify?token=${nominee.verification_token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: nominee.email,
    subject: `${ownerName || 'Someone'} added you as a nominee on InHerify`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb">
        <h2 style="margin:0 0 8px">InHerify</h2>
        <p style="color:#6b7280;margin:0 0 24px">${ownerName || 'Someone'} has added you (${nominee.name}) as a nominee to help manage their digital legacy. Please confirm to accept this role.</p>
        <a href="${link}" style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Verify nomination</a>
        <p style="color:#6b7280;font-size:13px;margin:24px 0 0">This link expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
      </div>`,
  });
}

// GET /api/nominees/verify — public, clicked from the nominee's email
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  const nominee = await Nominee.findOne({ verification_token: token });
  if (!nominee || !nominee.verification_expires_at || nominee.verification_expires_at < new Date()) {
    return res.status(400).send(verifyPage('Link expired', 'This verification link is invalid or has expired. Ask them to resend it from InHerify.', false));
  }
  nominee.verification_status = 'verified';
  nominee.verification_token = undefined;
  nominee.verification_expires_at = undefined;
  await nominee.save();
  await notify(nominee.user_id, 'nominee', 'Nominee verified', `${nominee.name} confirmed their nomination.`);
  try {
    await ActivityLog.create({
      id: uuid(), user_id: nominee.user_id, type: 'verify',
      description: `${nominee.name} verified their nomination`, ip: req.ip || '', device: '', location: '',
    });
  } catch (err) {
    console.error('[ACTIVITY] Failed to log nominee verification', err);
  }
  res.send(verifyPage('You’re verified', `Thanks — you're confirmed as a nominee for ${nominee.name}'s account.`, true));
});

router.use(auth);

// GET /api/nominees
router.get('/', async (req, res) => {
  const rows = await Nominee.find({ user_id: req.user.id }).sort({ added_at: -1 });
  res.json(rows.map(present));
});

// POST /api/nominees
router.post('/', async (req, res) => {
  const { name, email, phone, relation, sharePercentage } = req.body;
  const owner = await User.findOne({ id: req.user.id }).select('name');
  const row = await Nominee.create({
    id: uuid(),
    user_id: req.user.id,
    name,
    email,
    phone: phone || '',
    relation: relation || 'Family',
    share_percentage: sharePercentage || 0,
    verification_token: crypto.randomBytes(24).toString('hex'),
    verification_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  try {
    await sendVerificationEmail(row, owner?.name);
  } catch (err) {
    console.error('[NOMINEES] Failed to send verification email', err);
  }
  await notify(req.user.id, 'nominee', 'Nominee added', `${row.name} was added as a nominee and a verification email was sent.`);
  await logActivity(req, 'create', `Added nominee ${row.name}`);
  res.status(201).json(present(row));
});

// PUT /api/nominees/:id
router.put('/:id', async (req, res) => {
  const { name, email, phone, relation, sharePercentage } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  if (relation !== undefined) update.relation = relation;
  if (sharePercentage !== undefined) update.share_percentage = sharePercentage;

  const row = await Nominee.findOneAndUpdate(
    { id: req.params.id, user_id: req.user.id },
    update,
    { new: true }
  );
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(present(row));
});

// DELETE /api/nominees/:id
router.delete('/:id', async (req, res) => {
  const nominee = await Nominee.findOneAndDelete({ id: req.params.id, user_id: req.user.id });
  if (nominee) await logActivity(req, 'delete', `Removed nominee ${nominee.name}`);
  res.json({ id: req.params.id });
});

// POST /api/nominees/:id/verify — resend the verification email
router.post('/:id/verify', async (req, res) => {
  const nominee = await Nominee.findOne({ id: req.params.id, user_id: req.user.id });
  if (!nominee) return res.status(404).json({ error: 'Not found' });
  const owner = await User.findOne({ id: req.user.id }).select('name');
  nominee.verification_status = 'pending';
  nominee.verification_token = crypto.randomBytes(24).toString('hex');
  nominee.verification_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await nominee.save();
  try {
    await sendVerificationEmail(nominee, owner?.name);
  } catch (err) {
    console.error('[NOMINEES] Failed to resend verification email', err);
  }
  res.json({ id: req.params.id, status: 'pending' });
});

module.exports = router;
