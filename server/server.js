import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize, initDatabase, dbReady } from './db.js';
import { SiteSettings } from './models/index.js';
import auth from './routes/auth.js';
import studios from './routes/studios.js';
import bookings, { startHoldCleanup } from './routes/bookings.js';
import analytics from './routes/analytics.js';
import { seedIfEmpty, syncAdminFromEnv } from './scripts/seed.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set in production');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const origins = (process.env.CORS_ORIGINS || process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: origins.length ? origins : true,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    req.url = req.url.replace(/\/+(\?|#|$)/, '$1');
  }
  next();
});

app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (_req, res) => res.json({ ok: true, db: dbReady }));
app.use('/api/auth', auth);
app.use('/api/studios', studios);
app.use('/api/bookings', bookings);
app.use('/api/analytics', analytics);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use('/api', (_req, res) => res.status(404).json({ detail: 'Not found.' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`StudioPlus Node API running on ${host}:${port}`);
});

// No top-level await: Hostinger's lsnode loads this file with require().
(async () => {
  try {
    const connected = await initDatabase();
    if (!connected) return;
    await sequelize.sync();
    await SiteSettings.findOrCreate({ where: { id: 1 }, defaults: { mode: 'NORMAL' } });
    if (process.env.AUTO_SEED === 'true' || (process.env.NODE_ENV !== 'production' && process.env.AUTO_SEED !== 'false')) {
      await seedIfEmpty();
    }
    await syncAdminFromEnv();
    startHoldCleanup();
    console.log('Database connected');
  } catch (err) {
    console.error('Database startup failed:', err.message);
  }
})();
