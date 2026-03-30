const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

pool.connect((err) => {
  if (err) console.error('Error conectando a DB:', err.message);
  else console.log('✅ Conectado a PostgreSQL');
});

module.exports = pool;
