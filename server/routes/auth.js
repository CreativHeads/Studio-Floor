import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User } from '../models/index.js';
import { required, admin, tokensFor, sign, jwtSecret } from '../middleware/auth.js';
import { serializeUser } from '../lib/serialize.js';
import { verifyIdToken } from '../lib/firebase.js';

const r = Router();

const authLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many authentication attempts. Try again later.' },
});

async function findUserForLogin(email, password) {
  if (!email || !password) return null;
  let user = await User.findOne({ where: { email } });
  if (!user) {
    const username = String(email).split('@')[0];
    user = await User.findOne({ where: { username } });
  }
  if (!user || !user.password) return null;
  if (String(user.password).startsWith('pbkdf2_')) return null;
  const ok = await bcrypt.compare(password, user.password);
  return ok ? user : null;
}

async function createPhoneUser(phoneNumber, fullName, fallbackFirst) {
  const nameParts = String(fullName || fallbackFirst).trim().split(/\s+/);
  const first_name = nameParts[0] || fallbackFirst;
  const last_name = nameParts.slice(1).join(' ');
  const cleanPhone = String(phoneNumber).replace(/\D/g, '');
  const password = await bcrypt.hash(crypto.randomUUID(), 10);
  return User.create({
    first_name,
    last_name,
    username: cleanPhone,
    email: `${cleanPhone}@studiofloor.com`,
    phone_number: phoneNumber,
    role: 'CUSTOMER',
    password,
  });
}

r.post('/login', authLimit, async (req, res) => {
  const { email, password } = req.body || {};
  const user = await findUserForLogin(email, password);
  if (!user) {
    return res.status(401).json({ detail: 'No active account found with the given credentials' });
  }
  res.json({ ...tokensFor(user), user: serializeUser(user) });
});

r.post('/token/refresh', async (req, res) => {
  const refresh = req.body?.refresh;
  if (!refresh) return res.status(400).json({ detail: 'Refresh token is required' });
  try {
    const payload = jwt.verify(refresh, jwtSecret());
    if (payload.typ && payload.typ !== 'refresh') {
      return res.status(401).json({ detail: 'Token is invalid or expired' });
    }
    const user = await User.findByPk(payload.id || payload.user_id);
    if (!user) return res.status(401).json({ detail: 'Token is invalid or expired' });
    res.json({ access: sign(user, '1h', 'access'), refresh: sign(user, '7d', 'refresh') });
  } catch {
    res.status(401).json({ detail: 'Token is invalid or expired' });
  }
});

r.post('/register', authLimit, async (req, res) => {
  const {
    email, username, first_name, last_name, password, password_confirm, phone_number, role,
  } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ email: ['This field is required.'] });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ password: ['Password must be at least 8 characters.'] });
  }
  if (password !== password_confirm) {
    return res.status(400).json({ password: ['Passwords must match.'] });
  }
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ email: ['A user with that email already exists.'] });

  const user = await User.create({
    email,
    username: username || String(email).split('@')[0],
    first_name: first_name || '',
    last_name: last_name || '',
    phone_number: phone_number || null,
    role: role === 'ADMIN' || role === 'STAFF' ? role : 'CUSTOMER',
    password: await bcrypt.hash(password, 10),
  });

  res.status(201).json({
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    role: user.role,
  });
});

r.get('/profile', required, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ detail: 'Not found.' });
  res.json(serializeUser(user));
});

r.patch('/profile', required, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ detail: 'Not found.' });
  const allowed = ['email', 'username', 'first_name', 'last_name', 'phone_number', 'avatar_url'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  await user.save();
  res.json(serializeUser(user));
});

r.get('/users', required, admin, async (_req, res) => {
  const users = await User.findAll({ order: [['created_at', 'DESC']] });
  res.json(users.map(serializeUser));
});

r.get('/users/:id', required, admin, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ detail: 'Not found.' });
  res.json(serializeUser(user));
});

r.patch('/users/:id', required, admin, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ detail: 'Not found.' });
  const allowed = ['email', 'username', 'first_name', 'last_name', 'phone_number', 'avatar_url', 'role'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  await user.save();
  res.json(serializeUser(user));
});

r.delete('/users/:id', required, admin, async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ detail: 'Not found.' });
  await user.destroy();
  res.status(204).end();
});

r.post('/firebase-login', authLimit, async (req, res) => {
  const { id_token, full_name } = req.body || {};
  if (!id_token) return res.status(400).json({ error: 'Missing id_token' });

  const decoded = await verifyIdToken(id_token);
  if (!decoded) return res.status(401).json({ error: 'Invalid or expired Firebase token' });

  const phoneNumber = decoded.phone_number;
  if (!phoneNumber) return res.status(400).json({ error: 'No phone number found in token' });

  let user = await User.findOne({ where: { phone_number: phoneNumber } });
  if (!user) user = await createPhoneUser(phoneNumber, full_name, 'Creator');

  res.json({ ...tokensFor(user), user: serializeUser(user) });
});

r.post('/dev-login', async (req, res) => {
  const allowed = process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEV_LOGIN === 'true';
  if (!allowed) {
    return res.status(403).json({ error: 'Dev login is not allowed in production.' });
  }
  const { phone_number, full_name } = req.body || {};
  if (!phone_number) return res.status(400).json({ error: 'Missing phone number' });

  let user = await User.findOne({ where: { phone_number } });
  if (!user) user = await createPhoneUser(phone_number, full_name, 'Dev');

  res.json({ ...tokensFor(user), user: serializeUser(user) });
});

export default r;
