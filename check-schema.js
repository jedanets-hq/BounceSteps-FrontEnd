require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./config/postgresql');

async function check() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    
    console.log('service_providers columns:');
    result.rows.forEach(r => console.log('  -', r.column_name, ':', r.data_type));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
