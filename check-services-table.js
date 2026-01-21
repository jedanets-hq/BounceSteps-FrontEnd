const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkServicesTable() {
  try {
    console.log('🔍 Checking services table structure and data...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
      );
    `);
    
    console.log('✅ Services table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Services table does not exist! Need to create it.');
      await pool.end();
      return;
    }
    
    // Check columns
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Services table columns:');
    columnsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if there are any services
    const countResult = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`\n📊 Total services in database: ${countResult.rows[0].count}`);
    
    if (parseInt(countResult.rows[0].count) > 0) {
      // Show sample services
      const sampleServices = await pool.query(`
        SELECT id, provider_id, title, category, price, status, is_active, is_featured, created_at
        FROM services
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      console.log('\n📦 Sample services:');
      sampleServices.rows.forEach((service, idx) => {
        console.log(`\n   ${idx + 1}. ${service.title}`);
        console.log(`      ID: ${service.id}`);
        console.log(`      Provider ID: ${service.provider_id}`);
        console.log(`      Category: ${service.category}`);
        console.log(`      Price: ${service.price}`);
        console.log(`      Status: ${service.status}`);
        console.log(`      Active: ${service.is_active}`);
        console.log(`      Featured: ${service.is_featured}`);
        console.log(`      Created: ${service.created_at}`);
      });
    } else {
      console.log('\n⚠️ No services found in database!');
      console.log('   Provider needs to add services first.');
    }
    
    await pool.end();
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
  }
}

checkServicesTable();
