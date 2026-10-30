import { Sequelize } from 'sequelize';
import { env } from './env.ts';

export function createDatabase(): Sequelize {
  return new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    timezone: '+00:00',
    logging: false,
    pool: {
      max: env.DB_CONNECTION_LIMIT,
      min: 0,
      acquire: 30_000,
      idle: 10_000,
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
  });
}
