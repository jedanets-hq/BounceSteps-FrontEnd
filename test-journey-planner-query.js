const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testJourneyPlannerQuery() {
  try {
    console.log('🧪 TESTING JOURNEY PLANNER QUERIES\n');
    
    // Test 1: MWANZA + Food & Dining
    console.log('TEST 1: MWANZA region + Food & Dining category');
    const test1 = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND s.category = $2
      ORDER BY s.created_at DESC
    `, ['MWANZA', 'Food & Dining']);
    
    console.log(`  Found ${test1.rows.length} services:`);
    test1.rows.forEach(s => {
      console.log(`    - ${s.title} by ${s.business_name}`);
      console.log(`      Location: ${s.region}/${s.district}/${s.area}`);
    });
    console.log('');
    
    // Test 2: MBEYA + Transportation
    console.log('TEST 2: MBEYA region + Transportation category');
    const test2 = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND s.category = $2
      ORDER BY s.created_at DESC
    `, ['MBEYA', 'Transportation']);
    
    console.log(`  Found ${test2.rows.length} services:`);
    test2.rows.forEach(s => {
      console.log(`    - ${s.title} by ${s.business_name}`);
      console.log(`      Location: ${s.region}/${s.district}/${s.area}`);
    });
    console.log('');
    
    // Test 3: All services without filters
    console.log('TEST 3: All active services (no filters)');
    const test3 = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
      ORDER BY s.created_at DESC
    `);
    
    console.log(`  Found ${test3.rows.length} services:`);
    test3.rows.forEach(s => {
      console.log(`    - ${s.title} (${s.category}) by ${s.business_name} - ${s.region}`);
    });
    console.log('');
    
    console.log('✅ ALL QUERIES COMPLETED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testJourneyPlannerQuery();
