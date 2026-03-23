const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkUsersColumns() {
  try {
    console.log('🔍 Checking users table columns...\n');
    
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('Users table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if profile_image exists
    const hasProfileImage = columns.rows.some(col => col.column_name === 'profile_image');
    console.log(`\nHas profile_image column: ${hasProfileImage}`);
    
    // Check for similar columns
    const imageColumns = columns.rows.filter(col => 
      col.column_name.includes('image') || 
      col.column_name.includes('photo') || 
      col.column_name.includes('picture') ||
      col.column_name.includes('avatar')
    );
    
    if (imageColumns.length > 0) {
      console.log('\nImage-related columns found:');
      imageColumns.forEach(col => {
        console.log(`  - ${col.column_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersColumns();
