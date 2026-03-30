const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkProfile() {
  try {
    console.log('🔍 Checking profile for jedanetworksglobalhq@gmail.com...\n');
    
    // Get user
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, phone, user_type FROM users WHERE email = $1',
      ['jedanetworksglobalhq@gmail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ User found:');
    console.log(JSON.stringify(user, null, 2));
    console.log('\n');
    
    // Get provider profile
    const providerResult = await pool.query(
      'SELECT * FROM service_providers WHERE user_id = $1',
      [user.id]
    );
    
    if (providerResult.rows.length === 0) {
      console.log('❌ Provider profile not found');
    } else {
      console.log('✅ Provider profile found:');
      console.log(JSON.stringify(providerResult.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProfile();
