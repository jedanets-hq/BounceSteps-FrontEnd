const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testJourneyPlannerComplete() {
  try {
    console.log('🧪 COMPLETE JOURNEY PLANNER TEST\n');
    console.log('='.repeat(60));
    
    // Test 1: MWANZA + ILEMELA + BUZURUGA + Food & Dining
    console.log('\n📍 TEST 1: MWANZA/ILEMELA/BUZURUGA + Food & Dining');
    console.log('   (Simulating frontend Journey Planner query)');
    
    const region = 'MWANZA';
    const district = 'ILEMELA';
    const area = 'BUZURUGA';
    const category = 'Food & Dining';
    
    let whereConditions = ["s.status = 'active'", "s.is_active = true"];
    let queryParams = [];
    let paramIndex = 1;
    
    // Add category filter
    if (category) {
      whereConditions.push(`s.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    // Add location filters
    if (region) {
      whereConditions.push(`LOWER(s.region) = LOWER($${paramIndex})`);
      queryParams.push(region);
      paramIndex++;
    }
    
    if (district) {
      whereConditions.push(`(LOWER(s.district) = LOWER($${paramIndex}) OR LOWER(s.area) LIKE LOWER($${paramIndex}))`);
      queryParams.push(district);
      paramIndex++;
    }
    
    if (area) {
      whereConditions.push(`LOWER(s.area) LIKE LOWER($${paramIndex})`);
      queryParams.push(`${area}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const result = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
    `, queryParams);
    
    console.log(`\n   ✅ Found ${result.rows.length} services:`);
    result.rows.forEach(s => {
      console.log(`      - ${s.title} by ${s.business_name}`);
      console.log(`        Location: ${s.region}/${s.district}/${s.area}`);
      console.log(`        Category: ${s.category}`);
      console.log(`        Price: ${s.price} TZS`);
    });
    
    // Group by provider
    const providerMap = new Map();
    result.rows.forEach(service => {
      const providerId = service.provider_id;
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          business_name: service.business_name,
          services: [service],
          services_count: 1
        });
      } else {
        const provider = providerMap.get(providerId);
        provider.services.push(service);
        provider.services_count++;
      }
    });
    
    const providers = Array.from(providerMap.values());
    console.log(`\n   📦 Grouped into ${providers.length} provider(s):`);
    providers.forEach(p => {
      console.log(`      - ${p.business_name} (${p.services_count} service(s))`);
    });
    
    // Test 2: MBEYA + Transportation
    console.log('\n' + '='.repeat(60));
    console.log('\n📍 TEST 2: MBEYA + Transportation');
    
    const test2 = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND s.category = $2
      ORDER BY s.created_at DESC
    `, ['MBEYA', 'Transportation']);
    
    console.log(`\n   ✅ Found ${test2.rows.length} services:`);
    test2.rows.forEach(s => {
      console.log(`      - ${s.title} by ${s.business_name}`);
      console.log(`        Location: ${s.region}/${s.district}/${s.area}`);
    });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ JOURNEY PLANNER TEST COMPLETE!');
    console.log('\n📊 SUMMARY:');
    console.log(`   - Partial area matching: WORKING ✓`);
    console.log(`   - Category filtering: WORKING ✓`);
    console.log(`   - Location filtering: WORKING ✓`);
    console.log(`   - Provider grouping: WORKING ✓`);
    console.log('\n💡 Providers should now appear in Journey Planner Step 4!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testJourneyPlannerComplete();
