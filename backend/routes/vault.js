const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const VaultAsset = require('../models/VaultAsset');
const VaultDocument = require('../models/VaultDocument');
const notify = require('../utils/notify');
const logActivity = require('../utils/logActivity');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${uuid()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`),
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

function docTypeFromFile(mimetype, originalname) {
  const ext = (originalname.split('.').pop() || '').toLowerCase();
  if (mimetype === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx'].includes(ext)) return 'presentation';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'doc';
  return 'other';
}

function normalizeAsset(a) {
  const obj = typeof a.toJSON === 'function' ? a.toJSON() : a;
  return {
    id: obj.id,
    title: obj.title,
    category: obj.category,
    username: obj.username,
    url: obj.url,
    notes: obj.notes,
    status: obj.status ?? 'active',
    favorite: obj.favorite ?? false,
    encrypted: obj.encrypted ?? true,
    sharedWithNomineeIds: obj.sharedWithNomineeIds ?? [],
    createdAt: obj.createdAt || obj.created_at,
    updatedAt: obj.updated_at || obj.updatedAt,
    lastAccessedAt: obj.last_accessed_at || obj.lastAccessedAt,
  };
}

// GET /api/vault/assets
router.get('/assets', async (req, res) => {
  const { category } = req.query;
  const filter = { user_id: req.user.id };
  if (category && category !== 'custom') filter.category = category;
  const assets = await VaultAsset.find(filter).sort({ updated_at: -1 });
  res.json(assets.map(normalizeAsset));
});

// GET /api/vault/assets/:id
router.get('/assets/:id', async (req, res) => {
  const asset = await VaultAsset.findOne({ id: req.params.id, user_id: req.user.id });
  if (!asset) return res.status(404).json({ error: 'Not found' });
  res.json(normalizeAsset(asset));
});

// POST /api/vault/assets
router.post('/assets', async (req, res) => {
  const { title, category, username, url, notes, sharedWithNomineeIds = [] } = req.body;
  const asset = await VaultAsset.create({
    id: uuid(),
    user_id: req.user.id,
    title,
    category,
    username: username || null,
    url: url || null,
    notes: notes || null,
    sharedWithNomineeIds,
  });
  await notify(req.user.id, 'asset', 'Asset added', `"${asset.title}" was added to your vault.`);
  await logActivity(req, 'create', `Added asset "${asset.title}"`);
  res.status(201).json(normalizeAsset(asset));
});

// PUT /api/vault/assets/:id
router.put('/assets/:id', async (req, res) => {
  const { title, category, username, url, notes, status, favorite, sharedWithNomineeIds } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (category !== undefined) update.category = category;
  if (username !== undefined) update.username = username;
  if (url !== undefined) update.url = url;
  if (notes !== undefined) update.notes = notes;
  if (status !== undefined) update.status = status;
  if (favorite !== undefined) update.favorite = !!favorite;
  if (sharedWithNomineeIds !== undefined) update.sharedWithNomineeIds = sharedWithNomineeIds;

  const asset = await VaultAsset.findOneAndUpdate(
    { id: req.params.id, user_id: req.user.id },
    update,
    { new: true }
  );
  if (!asset) return res.status(404).json({ error: 'Not found' });
  await logActivity(req, sharedWithNomineeIds !== undefined ? 'share' : 'update', `Updated asset "${asset.title}"`);
  res.json(normalizeAsset(asset));
});

// DELETE /api/vault/assets/:id
router.delete('/assets/:id', async (req, res) => {
  const asset = await VaultAsset.findOneAndDelete({ id: req.params.id, user_id: req.user.id });
  if (asset) await logActivity(req, 'delete', `Deleted asset "${asset.title}"`);
  res.json({ id: req.params.id });
});

// PATCH /api/vault/assets/:id/favorite
router.patch('/assets/:id/favorite', async (req, res) => {
  const asset = await VaultAsset.findOne({ id: req.params.id, user_id: req.user.id });
  if (!asset) return res.status(404).json({ error: 'Not found' });
  asset.favorite = !asset.favorite;
  await asset.save();
  res.json({ id: asset.id, favorite: asset.favorite });
});

function normalizeDocument(d) {
  const obj = typeof d.toJSON === 'function' ? d.toJSON() : d;
  return {
    id: obj.id,
    name: obj.name,
    type: obj.type ?? 'other',
    size: obj.size ?? 0,
    category: obj.category ?? 'custom',
    uploadedAt: obj.uploaded_at,
    url: obj.url,
    encrypted: obj.encrypted ?? true,
    sharedWithNomineeIds: obj.sharedWithNomineeIds ?? [],
  };
}

// GET /api/vault/documents
router.get('/documents', async (req, res) => {
  const docs = await VaultDocument.find({ user_id: req.user.id }).sort({ uploaded_at: -1 });
  res.json(docs.map(normalizeDocument));
});

// POST /api/vault/documents/upload
router.post('/documents/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const { category } = req.body;
  let sharedWithNomineeIds = [];
  try { sharedWithNomineeIds = req.body.sharedWithNomineeIds ? JSON.parse(req.body.sharedWithNomineeIds) : []; } catch { /* ignore */ }

  const doc = await VaultDocument.create({
    id: uuid(),
    user_id: req.user.id,
    name: req.file.originalname,
    type: docTypeFromFile(req.file.mimetype, req.file.originalname),
    size: req.file.size,
    category: category || 'custom',
    url: '#',
    stored_filename: req.file.filename,
    mime_type: req.file.mimetype,
    sharedWithNomineeIds,
  });
  await notify(req.user.id, 'asset', 'Document uploaded', `"${doc.name}" was uploaded and encrypted.`);
  await logActivity(req, 'upload', `Uploaded document "${doc.name}"`);
  res.status(201).json(normalizeDocument(doc));
});

// GET /api/vault/documents/:id/file — streams the real file, ?mode=download|preview
router.get('/documents/:id/file', async (req, res) => {
  const doc = await VaultDocument.findOne({ id: req.params.id, user_id: req.user.id });
  if (!doc || !doc.stored_filename) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadsDir, doc.stored_filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

  const disposition = req.query.mode === 'download' ? 'attachment' : 'inline';
  res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
  res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(doc.name)}"`);
  if (req.query.mode === 'download') {
    await logActivity(req, 'download', `Downloaded document "${doc.name}"`);
  }
  fs.createReadStream(filePath).pipe(res);
});

// PUT /api/vault/documents/:id — update sharing / category
router.put('/documents/:id', async (req, res) => {
  const { sharedWithNomineeIds, category } = req.body;
  const update = {};
  if (sharedWithNomineeIds !== undefined) update.sharedWithNomineeIds = sharedWithNomineeIds;
  if (category !== undefined) update.category = category;
  const doc = await VaultDocument.findOneAndUpdate({ id: req.params.id, user_id: req.user.id }, update, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (sharedWithNomineeIds !== undefined) await logActivity(req, 'share', `Updated sharing for document "${doc.name}"`);
  res.json(normalizeDocument(doc));
});

// DELETE /api/vault/documents/:id
router.delete('/documents/:id', async (req, res) => {
  const doc = await VaultDocument.findOneAndDelete({ id: req.params.id, user_id: req.user.id });
  if (doc?.stored_filename) {
    fs.unlink(path.join(uploadsDir, doc.stored_filename), () => {});
  }
  if (doc) await logActivity(req, 'delete', `Deleted document "${doc.name}"`);
  res.json({ id: req.params.id });
});

module.exports = router;
