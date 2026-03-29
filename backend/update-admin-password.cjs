const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function updateAdminPassword() {
  try {
    console.log('🔧 Updating admin password...\n');
    
    // Hash the password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hashedPassword.substring(0, 30) + '...\n');
    
    // Update admin user
    const result = await pool.query(`
      UPDATE users
      SET password = $1
      WHERE email = 'admin@isafari.com'
      RETURNING id, email, first_name, last_name
    `, [hashedPassword]);
    
    if (result.rows.length > 0) {
      console.log('✅ Password updated successfully!');
      console.log('Admin:', result.rows[0].email);
      console.log('\n📋 Login credentials:');
      console.log('  Email: admin@isafari.com');
      console.log('  Password: admin123');
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();
