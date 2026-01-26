const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testFrontendBackendFlow() {
  try {
    console.log('🔍 DEEP RESEARCH: Frontend → Backend Flow\n');
    console.log('='.repeat(70));
    
    // STEP 1: Check what frontend sends
    console.log('\n📤 STEP 1: What Frontend Sends');
    console.log('   Location: MWANZA - ILEMELA - BUZURUGA');
    console.log('   Query params that should be sent:');
    console.log('     - region: MWANZA');
    console.log('     - district: ILEMELA');
    console.log('     - area: BUZURUGA');
    
    // STEP 2: Simulate backend query with EXACT parameters
    console.log('\n📥 STEP 2: Backend Query Simulation');
    
    const region = 'MWANZA';
    const district = 'ILEMELA';
    const area = 'BUZURUGA';
    const limit = 500;
    
    let whereConditions = ["s.status = 'active'", "s.is_active = true"];
    let queryParams = [];
    let paramIndex = 1;
    
    // Build query exactly as backend does
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
    
    queryParams.push(limit);
    
    const whereClause = whereConditions.join(' AND ');
    
    console.log('   WHERE clause:', whereClause);
    console.log('   Parameters:', queryParams);
    
    // STEP 3: Execute query
    console.log('\n🔎 STEP 3: Execute Query');
    
    const result = await pool.query(`
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
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex}
    `, queryParams);
    
    console.log(`   ✅ Query returned ${result.rows.length} services`);
    
    if (result.rows.length > 0) {
      console.log('\n📦 STEP 4: Services Found:');
      result.rows.forEach((s, i) => {
        console.log(`\n   Service ${i + 1}:`);
        console.log(`     Title: ${s.title}`);
        console.log(`     Category: ${s.category}`);
        console.log(`     Provider: ${s.business_name}`);
        console.log(`     Location: ${s.region}/${s.district}/${s.area}`);
        console.log(`     Provider ID: ${s.provider_id}`);
      });
      
      // STEP 5: Check if providers would be grouped
      console.log('\n👥 STEP 5: Provider Grouping:');
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
      console.log(`   ✅ Would show ${providers.length} provider(s):`);
      providers.forEach(p => {
        console.log(`     - ${p.business_name} (${p.services_count} service(s))`);
      });
      
      console.log('\n✅ SUCCESS: Providers should appear in frontend!');
      
    } else {
      console.log('\n❌ PROBLEM: No services found!');
      console.log('\n🔍 STEP 4: Debug - Check what\'s in database:');
      
      // Check all services
      const allServices = await pool.query(`
        SELECT id, title, category, region, district, area, status, is_active
        FROM services
        ORDER BY created_at DESC
      `);
      
      console.log(`\n   Total services in database: ${allServices.rows.length}`);
      allServices.rows.forEach(s => {
        console.log(`\n     - ${s.title}`);
        console.log(`       Category: ${s.category}`);
        console.log(`       Location: ${s.region}/${s.district}/${s.area}`);
        console.log(`       Status: ${s.status}, Active: ${s.is_active}`);
        
        // Check each condition
        const regionMatch = s.region && s.region.toLowerCase() === region.toLowerCase();
        const districtMatch = s.district && (s.district.toLowerCase() === district.toLowerCase() || s.area.toLowerCase().startsWith(district.toLowerCase()));
        const areaMatch = s.area && s.area.toLowerCase().startsWith(area.toLowerCase());
        
        console.log(`       Matches:`);
        console.log(`         Region (${region}): ${regionMatch ? '✅' : '❌'}`);
        console.log(`         District (${district}): ${districtMatch ? '✅' : '❌'}`);
        console.log(`         Area (${area}%): ${areaMatch ? '✅' : '❌'}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testFrontendBackendFlow();
