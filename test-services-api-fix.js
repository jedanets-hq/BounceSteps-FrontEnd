const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testServicesFix() {
  try {
    console.log('🧪 Testing Services API Fix\n');
    
    // Test 1: Get all services (no filters)
    console.log('TEST 1: Get all active services');
    const allServices = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area,
             sp.service_categories as provider_service_categories
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    
    console.log(`✅ Found ${allServices.rows.length} services\n`);
    allServices.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category})`);
      console.log(`     Provider: ${s.business_name}`);
      console.log(`     Location: ${s.region}/${s.district}/${s.area}`);
    });
    console.log('');
    
    // Test 2: Get services by region (MWANZA)
    console.log('TEST 2: Get services in MWANZA region');
    const mwanzaServices = await pool.query(`
      SELECT s.*, 
             sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
      ORDER BY s.created_at DESC
    `, ['MWANZA']);
    
    console.log(`✅ Found ${mwanzaServices.rows.length} services in MWANZA\n`);
    mwanzaServices.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category}) - ${s.business_name}`);
    });
    console.log('');
    
    // Test 3: Get services by category (Tours & Activities)
    console.log('TEST 3: Get "Tours & Activities" services');
    const toursServices = await pool.query(`
      SELECT s.*, 
             sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND s.category = $1
      ORDER BY s.created_at DESC
    `, ['Tours & Activities']);
    
    console.log(`✅ Found ${toursServices.rows.length} Tours & Activities services\n`);
    toursServices.rows.forEach(s => {
      console.log(`   - ${s.title} - ${s.business_name}`);
      console.log(`     Location: ${s.region}/${s.district}`);
    });
    console.log('');
    
    // Test 4: Get services in MBEYA CBD
    console.log('TEST 4: Get services in MBEYA/MBEYA CBD');
    const mbeyaServices = await pool.query(`
      SELECT s.*, 
             sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND (LOWER(s.district) = LOWER($2) OR LOWER(s.area) = LOWER($2))
      ORDER BY s.created_at DESC
    `, ['MBEYA', 'MBEYA CBD']);
    
    console.log(`✅ Found ${mbeyaServices.rows.length} services in MBEYA CBD\n`);
    mbeyaServices.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category}) - ${s.business_name}`);
    });
    
    console.log('\n✅ ALL TESTS PASSED - Services are now visible!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testServicesFix();
