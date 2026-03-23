const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!');
    console.log('Current time:', result.rows[0].now);
    
    // Check traveler_stories table
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'traveler_stories'
      );
    `);
    
    console.log('\n📋 Table traveler_stories exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get columns
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns
        WHERE table_name = 'traveler_stories'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      // Count stories
      const count = await pool.query('SELECT COUNT(*) FROM traveler_stories');
      console.log(`\n📊 Total stories: ${count.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
