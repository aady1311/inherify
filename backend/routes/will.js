const express = require('express');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');
const DigitalWill = require('../models/DigitalWill');
const notify = require('../utils/notify');
const logActivity = require('../utils/logActivity');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function normalize(will) {
  const obj = will.toJSON();
  const versions = [...obj.versions]
    .sort((a, b) => b.version - a.version)
    .map((v) => ({
      id: v.id,
      version: v.version,
      updatedAt: v.created_at,
      updatedBy: v.updated_by,
      summary: v.summary,
      published: !!v.published,
    }));
  return {
    id: obj.id,
    title: obj.title || 'My Digital Will',
    content: obj.content || '',
    status: obj.status || 'draft',
    updatedAt: obj.updated_at,
    signedAt: obj.signed_at,
    signatureHash: obj.signature_hash,
    versions,
  };
}

// GET /api/will
router.get('/', async (req, res) => {
  const will = await DigitalWill.findOne({ user_id: req.user.id });
  if (!will) return res.json(null);
  res.json(normalize(will));
});

async function upsertWithVersion(uid, content, status, summary, published, userEmail) {
  let will = await DigitalWill.findOne({ user_id: uid });
  if (!will) {
    will = new DigitalWill({ id: uuid(), user_id: uid, content, status });
  } else {
    will.content = content;
    will.status = status;
  }
  const maxV = will.versions.reduce((m, v) => Math.max(m, v.version), 0);
  will.versions.push({
    id: uuid(),
    version: maxV + 1,
    content,
    summary,
    updated_by: userEmail,
    published,
  });
  await will.save();
  return will;
}

// POST /api/will/draft
router.post('/draft', async (req, res) => {
  const { content } = req.body;
  const will = await upsertWithVersion(req.user.id, content, 'draft', 'Draft saved', false, req.user.email);
  await logActivity(req, 'update', 'Saved digital will draft');
  res.json(normalize(will));
});

// POST /api/will/publish
router.post('/publish', async (req, res) => {
  const { content } = req.body;
  const will = await upsertWithVersion(req.user.id, content, 'published', 'Published', true, req.user.email);
  await notify(req.user.id, 'system', 'Digital will published', 'Your digital will has been published.');
  await logActivity(req, 'update', 'Published digital will');
  res.json(normalize(will));
});

// POST /api/will/sign
router.post('/sign', async (req, res) => {
  const { content } = req.body;
  const hash = `0x${crypto.randomBytes(8).toString('hex')}`;
  let will = await DigitalWill.findOne({ user_id: req.user.id });
  if (!will) {
    will = new DigitalWill({ id: uuid(), user_id: req.user.id, content, status: 'draft' });
  } else if (content !== undefined) {
    will.content = content;
  }
  will.signed_at = new Date();
  will.signature_hash = hash;
  await will.save();
  await notify(req.user.id, 'verification', 'Will signed', 'Your digital will has been digitally signed.');
  await logActivity(req, 'verify', 'Signed digital will');
  res.json(normalize(will));
});

module.exports = router;
