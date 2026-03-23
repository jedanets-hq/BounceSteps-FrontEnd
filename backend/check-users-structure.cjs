const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function checkStructure() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== CHECKING DATABASE STRUCTURE ===\n');
    
    // 1. Check users table structure
    console.log('1. USERS TABLE STRUCTURE:');
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log(usersColumns.rows);
    
    // 2. Check service_providers table structure
    console.log('\n2. SERVICE_PROVIDERS TABLE STRUCTURE:');
    const providersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    console.log(providersColumns.rows);
    
    // 3. Check services table structure
    console.log('\n3. SERVICES TABLE STRUCTURE:');
    const servicesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    console.log(servicesColumns.rows);
    
    // 4. Get sample data from users
    console.log('\n4. SAMPLE USERS DATA (first 5 rows):');
    const sampleUsers = await client.query(`SELECT * FROM users LIMIT 5`);
    console.log(sampleUsers.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkStructure();
