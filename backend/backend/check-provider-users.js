require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./config/postgresql');

async function check() {
  try {
    const result = await pool.query("SELECT id, email, first_name, last_name, user_type FROM users WHERE user_type = 'service_provider'");
    
    console.log('All service provider users:');
    result.rows.forEach(u => {
      console.log('ID:', u.id, '| Email:', u.email);
      console.log('  Name:', u.first_name, u.last_name);
      console.log('');
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
