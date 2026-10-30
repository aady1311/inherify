require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const connectDB = require('./db/mongoose');
const User = require('./models/User');

async function seed() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  await User.create({
    id: uuid(), name: 'Admin', email,
    password_hash: hash, role: 'admin', status: 'active', plan: 'free',
  });
  console.log(`Admin created: ${email} / ${password}`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
