require('dotenv').config();
const { pool } = require('./models');

async function checkSchema() {
  try {
    console.log('🔍 Checking services table schema...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      ORDER BY ordinal_position
    `);
    
    console.log('Services table columns:');
    console.table(result.rows);
    
    // Check for promotion-related columns
    console.log('\n🎯 Promotion-related columns:');
    const promoColumns = result.rows.filter(col => 
      col.column_name.includes('featured') || 
      col.column_name.includes('trending') ||
      col.column_name.includes('priority') ||
      col.column_name.includes('boost') ||
      col.column_name.includes('visibility')
    );
    console.table(promoColumns);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkSchema();
