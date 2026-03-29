const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkPassword() {
  try {
    console.log('🔍 Checking user password...\n');
    
    const result = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      ['jedanetworksglobalhq@gmail.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ User found:', user.email);
    console.log('Password hash:', user.password);
    console.log('\n');
    
    // Test passwords
    const passwords = ['@Jctnftr01', 'Joctan@2025', 'password123'];
    
    for (const pwd of passwords) {
      const isMatch = await bcrypt.compare(pwd, user.password);
      console.log(`Testing "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPassword();
