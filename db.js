import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env;
const pool = mysql.createPool({
  host: env.HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

export default promisePool;
