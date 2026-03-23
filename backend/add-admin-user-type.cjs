const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function addAdminUserType() {
  try {
    console.log('🔧 Adding admin user type to constraint...\n');
    
    // Drop old constraint
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
    `);
    
    console.log('✅ Dropped old constraint');
    
    // Add new constraint with admin
    await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_user_type_check 
      CHECK (user_type IN ('traveler', 'service_provider', 'admin'));
    `);
    
    console.log('✅ Added new constraint with admin type');
    
    // Verify
    const result = await pool.query(`
      SELECT pg_get_constraintdef(con.oid) AS constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'users'
      AND con.conname = 'users_user_type_check';
    `);
    
    console.log('\n📋 New constraint:');
    console.log('  ', result.rows[0].constraint_definition);
    
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addAdminUserType();
