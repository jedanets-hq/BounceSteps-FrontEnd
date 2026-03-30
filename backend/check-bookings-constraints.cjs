const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkConstraints() {
  try {
    const result = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'bookings'
    `);
    
    console.log('Bookings foreign key constraints:');
    result.rows.forEach(r => {
      console.log(`  ${r.constraint_name}:`);
      console.log(`    ${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`);
    });
    
    // Check if provider_id=6 exists in service_providers
    const provider6 = await pool.query(`
      SELECT * FROM service_providers WHERE user_id = 6
    `);
    
    console.log(`\nProvider 6 exists in service_providers: ${provider6.rows.length > 0}`);
    if (provider6.rows.length > 0) {
      console.log('  Details:', JSON.stringify(provider6.rows[0], null, 2));
    }
    
    // Check if provider_id=6 exists in users
    const user6 = await pool.query(`
      SELECT * FROM users WHERE id = 6
    `);
    
    console.log(`\nUser 6 exists in users: ${user6.rows.length > 0}`);
    if (user6.rows.length > 0) {
      console.log('  Details:', JSON.stringify(user6.rows[0], null, 2));
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkConstraints();
