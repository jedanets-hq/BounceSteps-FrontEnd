const { pool } = require('./backend/config/postgresql');

async function check() {
  try {
    console.log('\n🔍 Checking database users...\n');
    
    const result = await pool.query('SELECT id, email, first_name FROM users LIMIT 5');
    
    if (result.rows.length === 0) {
      console.log('❌ No users in database');
      console.log('\n📝 Creating test user...\n');
      
      // Create test user
      const createResult = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, user_type, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, first_name`,
        ['traveler@example.com', 'password123', 'Test', 'Traveler', 'traveler', true, true]
      );
      
      console.log('✅ Test user created:');
      console.log('   Email:', createResult.rows[0].email);
      console.log('   ID:', createResult.rows[0].id);
    } else {
      console.log('✅ Found users:');
      result.rows.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
