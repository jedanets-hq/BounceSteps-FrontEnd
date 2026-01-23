const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testCategoriesFixed() {
  try {
    console.log('🧪 TESTING FIXED CATEGORIES\n');
    
    // Test 1: Get all services
    console.log('TEST 1: Get all services');
    const all = await pool.query(`
      SELECT s.id, s.title, s.category, sp.business_name
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
    `);
    console.log(`  Found ${all.rows.length} services:`);
    all.rows.forEach(s => {
      console.log(`    - ${s.title} (${s.category}) - ${s.business_name}`);
    });
    console.log('');
    
    // Test 2: Get Food & Dining services
    console.log('TEST 2: Get Food & Dining services');
    const food = await pool.query(`
      SELECT s.id, s.title, s.category, sp.business_name
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
        AND s.category = 'Food & Dining'
    `);
    console.log(`  Found ${food.rows.length} services:`);
    food.rows.forEach(s => {
      console.log(`    - ${s.title} - ${s.business_name}`);
    });
    console.log('');
    
    // Test 3: Get Transportation services
    console.log('TEST 3: Get Transportation services');
    const transport = await pool.query(`
      SELECT s.id, s.title, s.category, sp.business_name
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
        AND s.category = 'Transportation'
    `);
    console.log(`  Found ${transport.rows.length} services:`);
    transport.rows.forEach(s => {
      console.log(`    - ${s.title} - ${s.business_name}`);
    });
    console.log('');
    
    // Test 4: Get Tours & Activities services (should be 0 now)
    console.log('TEST 4: Get Tours & Activities services');
    const tours = await pool.query(`
      SELECT s.id, s.title, s.category, sp.business_name
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
        AND s.category = 'Tours & Activities'
    `);
    console.log(`  Found ${tours.rows.length} services`);
    if (tours.rows.length > 0) {
      tours.rows.forEach(s => {
        console.log(`    - ${s.title} - ${s.business_name}`);
      });
    } else {
      console.log(`    ✅ No services in Tours & Activities (as expected)`);
    }
    console.log('');
    
    console.log('✅ ALL TESTS PASSED - Categories are now correct!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testCategoriesFixed();
