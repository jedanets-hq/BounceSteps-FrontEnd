const { pool } = require('./config/postgresql');

async function diagnoseProviders() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('PROVIDER DIAGNOSIS - DEEP INVESTIGATION');
    console.log('='.repeat(60));

    // 1. Check all services
    console.log('\n📊 CHECKING SERVICES TABLE:');
    const servicesResult = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id, is_active
      FROM services
      ORDER BY id
    `);
    
    console.log(`Total services: ${servicesResult.rows.length}`);
    servicesResult.rows.forEach(s => {
      console.log(`\n  Service #${s.id}:`);
      console.log(`    Title: ${s.title}`);
      console.log(`    Category: ${s.category}`);
      console.log(`    Region: ${s.region || 'NULL'}`);
      console.log(`    District: ${s.district || 'NULL'}`);
      console.log(`    Area: ${s.area || 'NULL'}`);
      console.log(`    Provider ID: ${s.provider_id}`);
      console.log(`    Active: ${s.is_active}`);
    });

    // 2. Check all providers
    console.log('\n\n📊 CHECKING SERVICE_PROVIDERS TABLE:');
    const providersResult = await pool.query(`
      SELECT id, user_id, business_name, region, district, area, is_verified
      FROM service_providers
      ORDER BY id
    `);
    
    console.log(`Total providers: ${providersResult.rows.length}`);
    providersResult.rows.forEach(p => {
      console.log(`\n  Provider #${p.id}:`);
      console.log(`    User ID: ${p.user_id}`);
      console.log(`    Business: ${p.business_name}`);
      console.log(`    Region: ${p.region || 'NULL'}`);
      console.log(`    District: ${p.district || 'NULL'}`);
      console.log(`    Area: ${p.area || 'NULL'}`);
      console.log(`    Verified: ${p.is_verified}`);
    });

    // 3. Check service-provider relationship
    console.log('\n\n📊 CHECKING SERVICE-PROVIDER RELATIONSHIPS:');
    const relationshipResult = await pool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.category,
        s.region as service_region,
        s.district as service_district,
        s.provider_id,
        sp.business_name,
        sp.region as provider_region,
        sp.district as provider_district
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
      ORDER BY s.id
    `);
    
    console.log(`Total active services: ${relationshipResult.rows.length}`);
    
    let withProvider = 0;
    let withoutProvider = 0;
    let locationMismatch = 0;
    
    relationshipResult.rows.forEach(r => {
      if (r.provider_id && r.business_name) {
        withProvider++;
        
        if (r.service_region !== r.provider_region) {
          locationMismatch++;
          console.log(`\n  ⚠️ LOCATION MISMATCH:`);
          console.log(`    Service: ${r.title} (ID: ${r.service_id})`);
          console.log(`    Service region: ${r.service_region}`);
          console.log(`    Provider region: ${r.provider_region}`);
        }
      } else {
        withoutProvider++;
        console.log(`\n  ❌ SERVICE WITHOUT PROVIDER:`);
        console.log(`    Service: ${r.title} (ID: ${r.service_id})`);
        console.log(`    Provider ID: ${r.provider_id}`);
      }
    });
    
    console.log(`\n✅ Services with provider: ${withProvider}`);
    console.log(`❌ Services without provider: ${withoutProvider}`);
    console.log(`⚠️ Location mismatches: ${locationMismatch}`);

    // 4. Test filtering queries
    console.log('\n\n📊 TESTING FILTERING QUERIES:');
    
    // Test Mbeya region
    console.log('\n🔍 Test 1: Services in Mbeya region');
    const mbeyaResult = await pool.query(`
      SELECT s.id, s.title, s.category, s.region, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true 
      AND LOWER(s.region) = LOWER('Mbeya')
    `);
    
    console.log(`   Found: ${mbeyaResult.rows.length} services`);
    mbeyaResult.rows.forEach(r => {
      console.log(`   - ${r.title} (${r.category}) | Provider: ${r.business_name || 'NULL'}`);
    });

    // Test accommodation in Mbeya
    console.log('\n🔍 Test 2: Accommodation services in Mbeya');
    const mbeyaAccomResult = await pool.query(`
      SELECT s.id, s.title, s.category, s.region, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true 
      AND s.category = 'accommodation'
      AND LOWER(s.region) = LOWER('Mbeya')
    `);
    
    console.log(`   Found: ${mbeyaAccomResult.rows.length} services`);
    mbeyaAccomResult.rows.forEach(r => {
      console.log(`   - ${r.title} (${r.category}) | Provider: ${r.business_name || 'NULL'}`);
    });

    // Test all categories
    console.log('\n🔍 Test 3: All available categories');
    const categoriesResult = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `);
    
    console.log(`   Found: ${categoriesResult.rows.length} categories`);
    categoriesResult.rows.forEach(r => {
      console.log(`   - ${r.category}: ${r.count} services`);
    });

    // Test all regions
    console.log('\n🔍 Test 4: All available regions');
    const regionsResult = await pool.query(`
      SELECT region, COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY region
      ORDER BY count DESC
    `);
    
    console.log(`   Found: ${regionsResult.rows.length} regions`);
    regionsResult.rows.forEach(r => {
      console.log(`   - ${r.region || 'NULL'}: ${r.count} services`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSIS COMPLETE');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    process.exit(1);
  }
}

diagnoseProviders();
