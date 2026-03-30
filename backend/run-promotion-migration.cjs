require('dotenv').config();
const { pool } = require('./models');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Running promotion categories migration...\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add-promotion-categories.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify new columns
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND column_name IN (
        'search_priority',
        'category_priority',
        'is_enhanced_listing',
        'has_increased_visibility',
        'carousel_priority',
        'has_maximum_visibility',
        'promotion_expires_at',
        'promotion_payment_reference'
      )
      ORDER BY column_name
    `);
    
    console.log('📋 New promotion columns added:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    process.exit();
  }
}

runMigration();
