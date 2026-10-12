import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const jwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production');
  return 'dev-only-change-me';
};

export const sign = (user, exp = '1h', typ = 'access') =>
  jwt.sign(
    { id: user.id, user_id: user.id, role: user.role, typ },
    jwtSecret(),
    { expiresIn: exp }
  );

export function tokensFor(user) {
  return {
    access: sign(user, '1h', 'access'),
    refresh: sign(user, '7d', 'refresh'),
  };
}

function readBearer(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export function required(req, res, next) {
  const token = readBearer(req);
  if (!token) return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (payload.typ === 'refresh') return res.status(401).json({ detail: 'Invalid or missing token' });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ detail: 'Invalid or missing token' });
  }
}

export function optional(req, res, next) {
  const token = readBearer(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (payload.typ !== 'refresh') req.user = payload;
  } catch {
    // ignore expired/invalid tokens on public routes
  }
  next();
}

export function isAdminUser(user) {
  return user && (user.role === 'ADMIN' || user.role === 'STAFF');
}

export const admin = (req, res, next) =>
  isAdminUser(req.user) ? next() : res.status(403).json({ detail: 'Admin only' });

export async function loadUser(req) {
  if (!req.user?.id) return null;
  return User.findByPk(req.user.id);
}
