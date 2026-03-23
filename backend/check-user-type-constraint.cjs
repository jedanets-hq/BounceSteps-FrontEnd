const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkConstraint() {
  try {
    console.log('🔍 Checking user_type constraint...\n');
    
    const result = await pool.query(`
      SELECT 
        con.conname AS constraint_name,
        pg_get_constraintdef(con.oid) AS constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'users'
      AND con.contype = 'c'
      AND con.conname LIKE '%user_type%';
    `);
    
    if (result.rows.length > 0) {
      console.log('📋 User type constraint:');
      result.rows.forEach(row => {
        console.log(`  Name: ${row.constraint_name}`);
        console.log(`  Definition: ${row.constraint_definition}\n`);
      });
    } else {
      console.log('No user_type constraint found\n');
    }
    
    // Check existing user types
    const userTypes = await pool.query(`
      SELECT DISTINCT user_type, COUNT(*) as count
      FROM users
      GROUP BY user_type
    `);
    
    console.log('📊 Existing user types:');
    userTypes.rows.forEach(row => {
      console.log(`  - ${row.user_type}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkConstraint();
