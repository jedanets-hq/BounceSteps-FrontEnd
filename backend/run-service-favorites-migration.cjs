const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function runMigration() {
  try {
    console.log('🔄 Running service favorites migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-service-favorites.sql'),
      'utf8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Updated favorites table schema:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
