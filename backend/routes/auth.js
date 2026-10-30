const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuid } = require('uuid');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const ActivityLog = require('../models/ActivityLog');
const notify = require('../utils/notify');
const { auth } = require('../middleware/auth');

const router = express.Router();

const SAFE_FIELDS = 'id name email phone avatar role status plan two_factor_enabled joined_at last_login';

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp, subject, purpose) {
  console.log(`OTP for ${email} [${purpose}]: ${otp}`);
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb">
        <h2 style="margin:0 0 8px">InHerify</h2>
        <p style="color:#6b7280;margin:0 0 24px">${purpose}</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${otp}</div>
        <p style="color:#6b7280;font-size:13px;margin:16px 0 0">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>`,
  });
}

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.status === 'pending') {
      const otp = generateOtp();
      existing.otp_code = otp;
      existing.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
      await existing.save();
      console.log(`[SIGNUP] Email already registered but unverified, resending OTP — ${email}`);
      await sendOtpEmail(email, otp, 'Verify your InHerify account', 'Enter this code to verify your email address.');
      return res.json({ sent: true, email, resent: true });
    }
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = uuid();
  const otp = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await User.create({
    id, name, email, password_hash: hash,
    role: 'user', status: 'pending', plan: 'free',
    otp_code: otp, otp_expires_at: expires,
  });
  await Subscription.create({ id: uuid(), user_id: id, plan: 'free', status: 'active' });

  await sendOtpEmail(email, otp, 'Verify your InHerify account', 'Enter this code to verify your email address.');
  res.json({ sent: true, email });
});

// POST /api/auth/verify-email  (signup OTP verification)
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp_code !== code || !user.otp_expires_at || user.otp_expires_at < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  user.otp_code = undefined;
  user.otp_expires_at = undefined;
  user.status = 'active';
  await user.save();
  const safe = user.toJSON();
  delete safe.password_hash; delete safe.otp_code; delete safe.otp_expires_at;
  res.json({ verified: true, token: sign(user), user: safe });
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.status !== 'pending') return res.json({ sent: true }); // don't reveal account state
  const otp = generateOtp();
  user.otp_code = otp;
  user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOtpEmail(email, otp, 'Verify your InHerify account', 'Enter this code to verify your email address.');
  res.json({ sent: true, email });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password_hash) { console.log(`[LOGIN] Failed — not found or no password: ${email}`); return res.status(401).json({ error: 'Invalid credentials' }); }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) { console.log(`[LOGIN] Failed — wrong password: ${email}`); return res.status(401).json({ error: 'Invalid credentials' }); }
  if (user.status === 'suspended') { console.log(`[LOGIN] Blocked — suspended: ${email}`); return res.status(403).json({ error: 'Account suspended' }); }
  if (user.status === 'pending') { console.log(`[LOGIN] Blocked — unverified: ${email}`); return res.status(403).json({ error: 'Please verify your email before signing in', unverified: true, email }); }
  if (user.role === 'admin') { console.log(`[LOGIN] Blocked — admin tried user login: ${email}`); return res.status(403).json({ error: 'Please use the admin sign in page', isAdmin: true }); }

  user.last_login = new Date();
  await user.save();

  const ip = req.ip || req.headers['x-forwarded-for'] || '';
  await ActivityLog.create({
    id: uuid(), user_id: user.id, type: 'login', description: 'Signed in',
    ip, device: req.headers['user-agent'] || '', location: '',
  });
  await notify(user.id, 'security', 'New sign-in', `Signed in from a new session on ${new Date().toLocaleString('en')}.`);

  const safe = user.toJSON();
  delete safe.password_hash; delete safe.otp_code; delete safe.otp_expires_at;
  res.json({ user: safe, token: sign(user) });
});

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' });
  if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) { console.log(`[ADMIN-LOGIN] Failed — wrong password: ${email}`); return res.status(401).json({ error: 'Invalid credentials' }); }
  if (user.status !== 'active') return res.status(403).json({ error: 'Account suspended' });
  user.last_login = new Date();
  await user.save();
  console.log(`[ADMIN-LOGIN] Success — ${email}`);
  const safe = user.toJSON();
  delete safe.password_hash; delete safe.otp_code; delete safe.otp_expires_at;
  res.json({ user: safe, token: sign(user) });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ sent: true }); // don't reveal existence
  const otp = generateOtp();
  user.otp_code = otp;
  user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOtpEmail(email, otp, 'Reset your InHerify password', 'Use this code to reset your password.');
  res.json({ sent: true, email });
});

// POST /api/auth/verify-otp  (forgot-password OTP verification)
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp_code !== code || !user.otp_expires_at || user.otp_expires_at < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  user.otp_code = undefined;
  user.otp_expires_at = undefined;
  await user.save();
  const safe = user.toJSON();
  delete safe.password_hash; delete safe.otp_code; delete safe.otp_expires_at;
  res.json({ verified: true, token: sign(user), user: safe });
});

// POST /api/auth/reset-password
router.post('/reset-password', auth, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate({ id: req.user.id }, { password_hash: hash });
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  const user = await User.findOne({ id: req.user.id }).select(SAFE_FIELDS);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
