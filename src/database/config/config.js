const dotenv = require('dotenv');
dotenv.config()

const getPrefix = () => {
  var env = process.env.ENV || process.env.NODE_ENV;
  if (!env) {
    return env = 'DEV'
  }
  return env
}

const databaseConfig = async () => {
  const env = getPrefix();
  return {
    username: process.env[`${env}_USERNAME`] || 'postgres',
    database: process.env[`${env}_DATABASE`] || 'blog_solvit',
    password: process.env[`${env}_PASSWORD`] || '123',
    host: process.env[`${env}_HOST`] || 'localhost',
    port: process.env[`${env}_PORT`] || 5432,
    dialect: 'postgres'
  }
}

module.exports = databaseConfig