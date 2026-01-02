// Deep diagnosis script for Journey Planner provider visibility issue
const { pool } = require('./config/postgresql');

async function diagnoseIssue() {
  try {
    console.log('🔍 ========================================');
    console.log('🔍 DEEP DIAGNOSIS: Journey Planner Provider Visibility');
    console.log('🔍 ========================================\n');

    // 1. Check all services in MBEYA region
    console.log('📊 Step 1: Checking ALL services in MBEYA region...');
    const mbeyaServicesQuery = await pool.query(`
      SELECT 
        s.id, s.title, s.category, s.region, s.district, s.area,
        s.provider_id, s.is_active,
        sp.business_name, sp.is_verified
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE LOWER(s.region) = 'mbeya'
      ORDER BY s.category, s.district, s.area
    `);
    
    console.log(`   Found ${mbeyaServicesQuery.rows.length} services in MBEYA region`);
    console.log('\n   Services breakdown:');
    mbeyaServicesQuery.rows.forEach(service => {
      console.log(`   - ${service.title}`);
      console.log(`     Category: ${service.category}`);
      console.log(`     Location: ${service.region} → ${service.district || 'N/A'} → ${service.area || 'N/A'}`);
      console.log(`     Provider: ${service.business_name} (ID: ${service.provider_id})`);
      console.log(`     Active: ${service.is_active}, Verified: ${service.is_verified}`);
      console.log('');
    });

    // 2. Check services in MBEYA CBD specifically
    console.log('\n📍 Step 2: Checking services in MBEYA CBD...');
    const mbeyaCBDQuery = await pool.query(`
      SELECT 
        s.id, s.title, s.category, s.region, s.district, s.area,
        s.provider_id, s.is_active,
        sp.business_name, sp.is_verified
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE LOWER(s.region) = 'mbeya'
        AND (LOWER(s.district) LIKE '%mbeya%' OR LOWER(s.area) LIKE '%mbeya%')
      ORDER BY s.category
    `);
    
    console.log(`   Found ${mbeyaCBDQuery.rows.length} services in MBEYA CBD area`);
    mbeyaCBDQuery.rows.forEach(service => {
      console.log(`   - ${service.title} (${service.category})`);
      console.log(`     Location: ${service.district || 'N/A'} → ${service.area || 'N/A'}`);
    });

    // 3. Check accommodation services specifically
    console.log('\n🏨 Step 3: Checking ACCOMMODATION services in MBEYA...');
    const accommodationQuery = await pool.query(`
      SELECT 
        s.id, s.title, s.category, s.region, s.district, s.area,
        s.provider_id, s.is_active,
        sp.business_name, sp.is_verified, sp.region as provider_region,
        sp.district as provider_district, sp.area as provider_area
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE LOWER(s.region) = 'mbeya'
        AND LOWER(s.category) = 'accommodation'
      ORDER BY s.district, s.area
    `);
    
    console.log(`   Found ${accommodationQuery.rows.length} accommodation services in MBEYA`);
    accommodationQuery.rows.forEach(service => {
      console.log(`   - ${service.title}`);
      console.log(`     Service Location: ${service.region} → ${service.district || 'N/A'} → ${service.area || 'N/A'}`);
      console.log(`     Provider: ${service.business_name}`);
      console.log(`     Provider Location: ${service.provider_region || 'N/A'} → ${service.provider_district || 'N/A'} → ${service.provider_area || 'N/A'}`);
      console.log(`     Active: ${service.is_active}, Verified: ${service.is_verified}`);
      console.log('');
    });

    // 4. Check what the API would return for MBEYA + ACCOMMODATION
    console.log('\n🌐 Step 4: Simulating API call for MBEYA + ACCOMMODATION...');
    const apiSimulationQuery = await pool.query(`
      SELECT 
        s.id, s.title, s.category, s.region, s.district, s.area,
        s.provider_id, s.is_active,
        sp.business_name, sp.is_verified
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
        AND LOWER(s.region) = 'mbeya'
        AND LOWER(s.category) = 'accommodation'
    `);
    
    console.log(`   API would return: ${apiSimulationQuery.rows.length} services`);
    if (apiSimulationQuery.rows.length === 0) {
      console.log('   ❌ NO SERVICES WOULD BE RETURNED!');
      console.log('   This is the root cause of "No Providers Found"');
    } else {
      console.log('   ✅ Services found:');
      apiSimulationQuery.rows.forEach(service => {
        console.log(`      - ${service.title} (${service.business_name})`);
      });
    }

    // 5. Check all unique categories in database
    console.log('\n🏷️ Step 5: Checking all unique categories in database...');
    const categoriesQuery = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('   Available categories:');
    categoriesQuery.rows.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat.count} services`);
    });

    // 6. Check all unique regions
    console.log('\n🗺️ Step 6: Checking all unique regions in database...');
    const regionsQuery = await pool.query(`
      SELECT DISTINCT region, COUNT(*) as count
      FROM services
      WHERE is_active = true AND region IS NOT NULL
      GROUP BY region
      ORDER BY count DESC
    `);
    
    console.log('   Available regions:');
    regionsQuery.rows.forEach(reg => {
      console.log(`   - ${reg.region}: ${reg.count} services`);
    });

    // 7. Check for case sensitivity issues
    console.log('\n🔤 Step 7: Checking for case sensitivity issues...');
    const caseCheckQuery = await pool.query(`
      SELECT 
        category,
        region,
        COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY category, region
      HAVING LOWER(region) = 'mbeya' OR LOWER(category) = 'accommodation'
      ORDER BY region, category
    `);
    
    console.log('   Case variations found:');
    caseCheckQuery.rows.forEach(row => {
      console.log(`   - Region: "${row.region}", Category: "${row.category}" (${row.count} services)`);
    });

    // 8. Check provider data integrity
    console.log('\n👥 Step 8: Checking provider data integrity...');
    const providerCheckQuery = await pool.query(`
      SELECT 
        sp.id, sp.business_name, sp.region, sp.district, sp.area,
        sp.is_verified, sp.service_categories,
        COUNT(s.id) as service_count
      FROM service_providers sp
      LEFT JOIN services s ON sp.id = s.provider_id AND s.is_active = true
      WHERE LOWER(sp.region) = 'mbeya'
      GROUP BY sp.id, sp.business_name, sp.region, sp.district, sp.area, sp.is_verified, sp.service_categories
      ORDER BY service_count DESC
    `);
    
    console.log(`   Found ${providerCheckQuery.rows.length} providers in MBEYA region`);
    providerCheckQuery.rows.forEach(provider => {
      console.log(`   - ${provider.business_name}`);
      console.log(`     Location: ${provider.region} → ${provider.district || 'N/A'} → ${provider.area || 'N/A'}`);
      console.log(`     Categories: ${provider.service_categories ? provider.service_categories.join(', ') : 'N/A'}`);
      console.log(`     Active Services: ${provider.service_count}`);
      console.log(`     Verified: ${provider.is_verified}`);
      console.log('');
    });

    console.log('\n🔍 ========================================');
    console.log('🔍 DIAGNOSIS COMPLETE');
    console.log('🔍 ========================================');

  } catch (error) {
    console.error('❌ Diagnosis error:', error);
  } finally {
    await pool.end();
  }
}

diagnoseIssue();
