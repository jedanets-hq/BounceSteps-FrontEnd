const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkProviderData() {
  console.log('🔍 Checking provider data...\n');
  
  try {
    // Check services table
    console.log('📦 Services with provider_id:');
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, business_name
      FROM services
      LIMIT 5
    `);
    console.table(servicesResult.rows);
    
    // Check service_providers table
    console.log('\n👥 Service Providers:');
    const providersResult = await pool.query(`
      SELECT sp.id as sp_id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 5
    `);
    console.table(providersResult.rows);
    
    // Check users table
    console.log('\n👤 Users (service providers):');
    const usersResult = await pool.query(`
      SELECT id, email, role, first_name, last_name
      FROM users
      WHERE role = 'service_provider'
      LIMIT 5
    `);
    console.table(usersResult.rows);
    
    // Check the relationship
    console.log('\n🔗 Checking relationship:');
    const relationshipResult = await pool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id as service_provider_id,
        sp.id as sp_table_id,
        sp.user_id as sp_user_id,
        u.email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LEFT JOIN users u ON sp.user_id = u.id
      LIMIT 5
    `);
    console.table(relationshipResult.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProviderData();
