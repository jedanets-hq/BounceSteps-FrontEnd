const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'isafari_db',
  password: '@Jctnftr01',
  port: 5432,
});

async function testGoogleRegistration() {
  try {
    console.log('🔍 Checking recent Google registrations...\n');
    
    // Check recent users
    const usersResult = await pool.query(`
      SELECT id, email, first_name, last_name, user_type, google_id, auth_provider, is_verified, created_at
      FROM users 
      WHERE email LIKE '%safari%' 
      ORDER BY id DESC 
      LIMIT 10
    `);
    
    console.log('📊 Recent Safari users:');
    console.table(usersResult.rows);
    
    // Check if there are any users stuck in registration
    const incompleteResult = await pool.query(`
      SELECT id, email, first_name, last_name, user_type, google_id, auth_provider
      FROM users 
      WHERE google_id IS NOT NULL 
      AND (first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = '')
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    if (incompleteResult.rows.length > 0) {
      console.log('\n⚠️ Users with incomplete data:');
      console.table(incompleteResult.rows);
    } else {
      console.log('\n✅ No incomplete Google registrations found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

testGoogleRegistration();
