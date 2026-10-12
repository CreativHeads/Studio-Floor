import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const useMysql = Boolean(process.env.DB_HOST);

export const sequelize = useMysql
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      timezone: '+00:00',
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'data.sqlite'),
      logging: false,
      retry: { max: 5 },
      pool: { max: 1, idle: 30000 },
    });
