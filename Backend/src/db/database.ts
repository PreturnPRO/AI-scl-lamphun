import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'

const sslEnabled = (process.env.DB_SSL ?? 'true') === 'true'
const sslCa = process.env.DB_SSL_CA

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined
const sslConfig = sslEnabled
  ? {
      rejectUnauthorized: true,
      ca: sslCa ? sslCa : undefined
    }
  : undefined

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: sslConfig
});

export async function initialize() {
  const database = process.env.DB_DATABASE;
  if (!database) throw new Error("DB_DATABASE is not set");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: dbPort,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: sslConfig
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await connection.end();

  return drizzle(pool);
}