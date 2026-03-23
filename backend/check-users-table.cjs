const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkUsersTable() {
  try {
    console.log('🔍 Checking users table structure...\n');
    
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Users table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check for admin users
    const adminCheck = await pool.query(`
      SELECT id, first_name, last_name, email, user_type
      FROM users
      WHERE user_type = 'admin'
    `);
    
    console.log(`\n👤 Admin users found: ${adminCheck.rows.length}`);
    adminCheck.rows.forEach(admin => {
      console.log(`  - ${admin.first_name} ${admin.last_name} (${admin.email})`);
    });
    
    // Check for traveler users
    const travelerCheck = await pool.query(`
      SELECT id, first_name, last_name, email, user_type
      FROM users
      WHERE user_type = 'traveler'
      LIMIT 5
    `);
    
    console.log(`\n🧳 Traveler users found: ${travelerCheck.rows.length}`);
    travelerCheck.rows.forEach(traveler => {
      console.log(`  - ${traveler.first_name} ${traveler.last_name} (${traveler.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
