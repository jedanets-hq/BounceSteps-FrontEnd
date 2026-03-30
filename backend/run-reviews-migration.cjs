const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function runReviewsMigration() {
  try {
    console.log('🔄 Running reviews table migration...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'create-reviews-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('✅ Reviews table created successfully!');
    console.log('✅ Triggers for auto-updating ratings created!');
    console.log('');
    
    // Verify table was created
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Reviews table columns:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    console.log('');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

runReviewsMigration();
