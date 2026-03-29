const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '34.42.58.123',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bouncesteps-db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '@JedaNets01',
});

async function runPaymentMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Running payment system migration...');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/add-payment-system.sql'), 'utf8');
    await client.query(sql);
    console.log('✅ Payment system tables created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runPaymentMigration();
