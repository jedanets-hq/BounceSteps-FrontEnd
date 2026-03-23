const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function createTestUser() {
  try {
    const email = 'testfavorites@test.com';
    const password = 'Test123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('✅ User already exists:', email);
      console.log('   Password:', password);
      return;
    }
    
    // Create user
    const result = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, user_type, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, user_type
    `, [email, hashedPassword, 'Test', 'Favorites', 'traveler', true]);
    
    console.log('✅ Test user created:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   User ID:', result.rows[0].id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();
