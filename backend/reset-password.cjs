const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function resetPassword() {
  try {
    console.log('🔐 Resetting password for jedanetworksglobalhq@gmail.com...\n');
    
    const newPassword = '@Jctnftr01';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, 'jedanetworksglobalhq@gmail.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Password reset successfully!');
    console.log('Email:', result.rows[0].email);
    console.log('New password:', newPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
