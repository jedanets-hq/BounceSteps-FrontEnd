const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function checkReviewsTable() {
  try {
    console.log('🔍 Checking for reviews/ratings tables...\n');
    
    // Check if reviews table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%review%' OR table_name LIKE '%rating%')
    `);
    
    console.log('📋 Tables found:', tableCheck.rows.length);
    tableCheck.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    console.log('');
    
    // Check services table for rating columns
    const servicesColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND (column_name LIKE '%rating%' OR column_name LIKE '%review%')
    `);
    
    console.log('📊 Services table rating columns:');
    if (servicesColumns.rows.length === 0) {
      console.log('  ❌ No rating columns found in services table');
    } else {
      servicesColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }
    console.log('');
    
    // Check service_providers table for rating columns
    const providersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_providers' 
      AND (column_name LIKE '%rating%' OR column_name LIKE '%review%')
    `);
    
    console.log('📊 Service_providers table rating columns:');
    if (providersColumns.rows.length === 0) {
      console.log('  ❌ No rating columns found in service_providers table');
    } else {
      providersColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }
    console.log('');
    
    // Check all tables
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 All tables in database:');
    allTables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkReviewsTable();
