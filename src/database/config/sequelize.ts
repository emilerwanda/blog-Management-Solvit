import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const getPrefix = () => {
  var env = process.env.ENV || process.env.NODE_ENV;
  if (!env) {
    return env = 'DEV'
  }
  return env
}

const env = getPrefix();
const sequelize = new Sequelize(
  process.env[`${env}_DATABASE`] || 'blog_solvit',      // database name
  process.env[`${env}_USERNAME`] || 'postgres',         // username
  process.env[`${env}_PASSWORD`] || '123',              // password
  {
    host: process.env[`${env}_HOST`] || 'localhost',
    port: Number(process.env[`${env}_PORT`]) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export { sequelize };
