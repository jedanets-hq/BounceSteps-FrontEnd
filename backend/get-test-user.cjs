const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function getUsers() {
  try {
    const result = await pool.query(`
      SELECT id, email, user_type, first_name, last_name 
      FROM users 
      WHERE user_type = 'traveler' 
      LIMIT 3
    `);
    
    console.log('Traveler users:');
    console.table(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

getUsers();
