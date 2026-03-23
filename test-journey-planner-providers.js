const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderFlow() {
  console.log('🔍 TESTING JOURNEY PLANNER PROVIDER FLOW\n');
  console.log('=' .repeat(80));
  
  // Test case: Mwanza → Ilemela → Buzuruga with selected category
  const testLocation = {
    region: 'Mwanza',
    district: 'Ilemela',
    ward: 'Buzuruga' // Frontend calls it "ward", backend calls it "area"
  };
  
  const testCategory = 'Accommodation'; // Example category
  
  console.log('\n📍 TEST SCENARIO:');
  console.log(`   Location: ${testLocation.region} → ${testLocation.district} → ${testLocation.ward}`);
  console.log(`   Category: ${testCategory}`);
  console.log('\n' + '='.repeat(80));
  
  try {
    // Step 1: Check what services exist in the database for this location
    console.log('\n📦 STEP 1: Checking services in database...\n');
    
    const allServicesQuery = `
      SELECT id, title, category, region, district, area, provider_id, business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT 100
    `;
    
    const allServices = await pool.query(allServicesQuery);
    console.log(`   Total active services in DB: ${allServices.rows.length}`);
    
    // Step 2: Filter by region (case-insensitive)
    const servicesInRegion = allServices.rows.filter(s => 
      (s.region || '').toLowerCase() === testLocation.region.toLowerCase()
    );
    console.log(`   Services in ${testLocation.region}: ${servicesInRegion.length}`);
    
    if (servicesInRegion.length > 0) {
      console.log('\n   Sample services in region:');
      servicesInRegion.slice(0, 5).forEach(s => {
        console.log(`      - ${s.title} (${s.category}) at ${s.district || 'N/A'}, ${s.area || 'N/A'}`);
      });
    }
    
    // Step 3: Filter by district (case-insensitive)
    // IMPORTANT: Frontend's "district" might actually be stored in "area" field!
    const servicesInDistrict = servicesInRegion.filter(s => {
      const serviceDistrict = (s.district || '').toLowerCase();
      const serviceArea = (s.area || '').toLowerCase();
      const searchDistrict = testLocation.district.toLowerCase();
      
      return serviceDistrict === searchDistrict || serviceArea === searchDistrict;
    });
    console.log(`\n   Services in ${testLocation.district}: ${servicesInDistrict.length}`);
    
    if (servicesInDistrict.length > 0) {
      console.log('\n   Sample services in district:');
      servicesInDistrict.slice(0, 5).forEach(s => {
        console.log(`      - ${s.title} (${s.category}) at ${s.district || 'N/A'}, ${s.area || 'N/A'}`);
      });
    }
    
    // Step 4: Filter by ward/area (case-insensitive)
    const servicesInWard = servicesInDistrict.filter(s => {
      const serviceArea = (s.area || '').toLowerCase();
      const searchWard = testLocation.ward.toLowerCase();
      
      // Use partial matching for areas (e.g., "BUZURUGA" matches "BUZURUGA KASKAZINI")
      return serviceArea.includes(searchWard) || searchWard.includes(serviceArea);
    });
    console.log(`\n   Services in ${testLocation.ward}: ${servicesInWard.length}`);
    
    if (servicesInWard.length > 0) {
      console.log('\n   Sample services in ward:');
      servicesInWard.slice(0, 5).forEach(s => {
        console.log(`      - ${s.title} (${s.category}) at ${s.district || 'N/A'}, ${s.area || 'N/A'}`);
      });
    }
    
    // Step 5: Filter by category (case-insensitive)
    const servicesInCategory = servicesInWard.filter(s => 
      (s.category || '').toLowerCase() === testCategory.toLowerCase()
    );
    console.log(`\n   Services in category "${testCategory}": ${servicesInCategory.length}`);
    
    if (servicesInCategory.length > 0) {
      console.log('\n   Matching services:');
      servicesInCategory.forEach(s => {
        console.log(`      ✅ ${s.title} (${s.category}) - Provider: ${s.business_name || 'N/A'}`);
        console.log(`         Location: ${s.region} → ${s.district || 'N/A'} → ${s.area || 'N/A'}`);
      });
    }
    
    // Step 6: Simulate the API call that frontend makes
    console.log('\n' + '='.repeat(80));
    console.log('\n🌐 STEP 2: Simulating API call from frontend...\n');
    
    const apiQuery = `
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE s.status = 'active' 
        AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND (LOWER(s.district) = LOWER($2) OR LOWER(s.area) = LOWER($2))
        AND LOWER(s.category) = LOWER($3)
      ORDER BY s.created_at DESC
      LIMIT 100
    `;
    
    const apiResult = await pool.query(apiQuery, [
      testLocation.region,
      testLocation.district,
      testCategory
    ]);
    
    console.log(`   API returned: ${apiResult.rows.length} services`);
    
    if (apiResult.rows.length > 0) {
      console.log('\n   Services from API:');
      apiResult.rows.forEach(s => {
        console.log(`      ✅ ${s.title} (${s.category})`);
        console.log(`         Provider: ${s.business_name}`);
        console.log(`         Location: ${s.region} → ${s.district || 'N/A'} → ${s.area || 'N/A'}`);
      });
    } else {
      console.log('\n   ❌ NO SERVICES RETURNED FROM API');
      console.log('\n   🔍 DEBUGGING: Let\'s check what\'s in the database...');
      
      // Debug: Check services without category filter
      const debugQuery = await pool.query(`
        SELECT s.*, sp.business_name
        FROM services s
        INNER JOIN service_providers sp ON s.provider_id = sp.user_id
        WHERE s.status = 'active' 
          AND s.is_active = true
          AND LOWER(s.region) = LOWER($1)
        LIMIT 10
      `, [testLocation.region]);
      
      console.log(`\n   Services in ${testLocation.region} (any category): ${debugQuery.rows.length}`);
      if (debugQuery.rows.length > 0) {
        console.log('\n   Available categories in this region:');
        const categories = [...new Set(debugQuery.rows.map(s => s.category))];
        categories.forEach(cat => {
          const count = debugQuery.rows.filter(s => s.category === cat).length;
          console.log(`      - ${cat}: ${count} services`);
        });
      }
    }
    
    // Step 7: Group by provider
    console.log('\n' + '='.repeat(80));
    console.log('\n👥 STEP 3: Grouping services by provider...\n');
    
    const providerMap = new Map();
    apiResult.rows.forEach(service => {
      const providerId = service.provider_id;
      if (!providerId) return;
      
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          business_name: service.business_name || 'Service Provider',
          location: `${service.district || ''}, ${service.region || ''}`.trim(),
          region: service.region,
          district: service.district,
          ward: service.area,
          services: [service],
          service_categories: [service.category]
        });
      } else {
        const provider = providerMap.get(providerId);
        provider.services.push(service);
        if (!provider.service_categories.includes(service.category)) {
          provider.service_categories.push(service.category);
        }
      }
    });
    
    const providers = Array.from(providerMap.values());
    console.log(`   Unique providers: ${providers.length}`);
    
    if (providers.length > 0) {
      console.log('\n   Providers:');
      providers.forEach(p => {
        console.log(`      ✅ ${p.business_name}`);
        console.log(`         Location: ${p.location}`);
        console.log(`         Categories: ${p.service_categories.join(', ')}`);
        console.log(`         Services: ${p.services.length}`);
      });
    } else {
      console.log('\n   ❌ NO PROVIDERS FOUND');
    }
    
    // Final diagnosis
    console.log('\n' + '='.repeat(80));
    console.log('\n🔬 DIAGNOSIS:\n');
    
    if (providers.length === 0) {
      console.log('   ❌ PROBLEM IDENTIFIED:');
      console.log('      No providers are being returned to the frontend.');
      console.log('\n   POSSIBLE CAUSES:');
      console.log('      1. No services exist for the selected location + category combination');
      console.log('      2. Location data mismatch (region/district/area naming)');
      console.log('      3. Category name mismatch (case sensitivity or spelling)');
      console.log('      4. Services exist but are inactive or have wrong status');
      console.log('\n   RECOMMENDED FIXES:');
      console.log('      1. Check if services exist in the database for this location');
      console.log('      2. Verify location field mapping (ward → area)');
      console.log('      3. Add case-insensitive and partial matching for locations');
      console.log('      4. Consider hierarchical location matching (show region-level services)');
    } else {
      console.log('   ✅ SUCCESS: Providers found and should be displayed!');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testProviderFlow();
