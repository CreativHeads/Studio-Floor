import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const useMysql = Boolean(process.env.DB_HOST);
// Hostinger MySQL grants localhost, not IPv6 ::1. Node resolves localhost to ::1.
const mysqlHost = (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '::1')
  ? '127.0.0.1'
  : process.env.DB_HOST;

export let dbReady = false;

export const sequelize = useMysql
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      host: mysqlHost,
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      timezone: '+00:00',
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
        connectTimeout: 4000,
      },
      pool: { max: 5, min: 0, acquire: 4000, idle: 10000 },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'data.sqlite'),
      logging: false,
      retry: { max: 5 },
      pool: { max: 1, idle: 30000 },
    });

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    dbReady = true;
    return true;
  } catch (err) {
    dbReady = false;
    console.error('Database authenticate failed:', err.message);
    return false;
  }
}
