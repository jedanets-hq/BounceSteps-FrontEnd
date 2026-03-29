const { pool } = require('../models');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running service featured/trending migration...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-service-featured-trending.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute migration
    await client.query(sql);
    
    console.log('✅ Migration completed successfully');
    console.log('   - Added is_featured column to services table');
    console.log('   - Added is_trending column to services table');
    console.log('   - Created indexes for better performance');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigration();
