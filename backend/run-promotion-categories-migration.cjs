const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '@Jctnftr01'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting promotion categories migration...');
    
    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-promotion-categories.sql'),
      'utf8'
    );
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Promotion categories migration completed successfully!');
    
    // Verify columns were added
    const result = await client.query(`
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
        'promotion_expires_at'
      )
      ORDER BY column_name;
    `);
    
    console.log('\n📊 Added columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) = ${row.column_default || 'NULL'}`);
    });
    
    // Check if any services exist
    const servicesCount = await client.query('SELECT COUNT(*) as count FROM services');
    console.log(`\n📦 Total services in database: ${servicesCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
