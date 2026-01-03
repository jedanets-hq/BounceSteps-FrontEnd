const { pool } = require('./backend/config/postgresql');

async function checkUsers() {
  try {
    console.log('\n🔍 Checking users in database...\n');
    
    const result = await pool.query('SELECT id, email, first_name, last_name FROM users LIMIT 10');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${result.rows.length} users:\n`);
      result.rows.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.email} (ID: ${user.id}) - ${user.first_name} ${user.last_name}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
