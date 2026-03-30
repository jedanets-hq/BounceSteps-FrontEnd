require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./models');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = 8',
      [hashedPassword]
    );
    
    console.log('✅ Password reset for user 8 (mfungo@gmail.com)');
    console.log('   New password: Test@123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

resetPassword();
