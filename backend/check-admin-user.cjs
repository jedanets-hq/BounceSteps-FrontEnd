const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin user...\n');
    
    const result = await pool.query(`
      SELECT id, email, password, first_name, last_name, user_type, is_verified, is_active
      FROM users
      WHERE user_type = 'admin'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin user found!');
    } else {
      console.log('✅ Admin users found:', result.rows.length);
      result.rows.forEach(admin => {
        console.log('\n📋 Admin details:');
        console.log('  ID:', admin.id);
        console.log('  Email:', admin.email);
        console.log('  Name:', admin.first_name, admin.last_name);
        console.log('  Password hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'NULL');
        console.log('  Verified:', admin.is_verified);
        console.log('  Active:', admin.is_active);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();
