const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function addStatusColumn() {
  try {
    console.log('🔍 Adding status column to traveler_stories...\n');
    
    // Check if status column exists
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'traveler_stories' 
        AND column_name = 'status'
      );
    `);
    
    if (columnCheck.rows[0].exists) {
      console.log('✅ Status column already exists!');
    } else {
      console.log('⚙️  Adding status column...');
      
      await pool.query(`
        ALTER TABLE traveler_stories 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected'));
      `);
      
      console.log('✅ Status column added successfully!');
      
      // Create index
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_traveler_stories_status 
        ON traveler_stories(status);
      `);
      
      console.log('✅ Index created!');
    }
    
    // Verify
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'traveler_stories'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Current columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addStatusColumn();
