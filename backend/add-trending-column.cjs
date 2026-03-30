const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function addTrendingColumn() {
  try {
    console.log('🔧 Adding is_trending column to services table...\n');
    
    // Check if column exists
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'services' AND column_name = 'is_trending'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Column is_trending already exists');
    } else {
      // Add the column
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN is_trending BOOLEAN DEFAULT false
      `);
      console.log('✅ Column is_trending added successfully');
    }
    
    // Verify
    const verify = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'services' 
      AND column_name IN ('is_featured', 'is_trending')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Current columns:');
    verify.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}, default: ${col.column_default}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addTrendingColumn();
