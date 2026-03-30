/**
 * Delete test user from database
 */

require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/models');

async function deleteTestUser() {
  try {
    console.log('🗑️ Deleting test user...');
    
    const result = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING *',
      ['provider@test.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Test user deleted:', result.rows[0].email);
    } else {
      console.log('ℹ️ Test user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting test user:', error.message);
    process.exit(1);
  }
}

deleteTestUser();
