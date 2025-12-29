const { pool } = require('./backend/config/postgresql');

async function checkUser() {
  try {
    const result = await pool.query('SELECT id, email FROM users LIMIT 5');
    console.log('Users in database:');
    if (result.rows.length === 0) {
      console.log('  No users found');
    } else {
      result.rows.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUser();
