import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DEV_DATABASE || '',
  process.env.DEV_USERNAME || '',
  process.env.DEV_PASSWORD || '',
  {
    host: process.env.DEV_HOST || 'localhost',
    port: Number(process.env.DEV_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export { sequelize };
