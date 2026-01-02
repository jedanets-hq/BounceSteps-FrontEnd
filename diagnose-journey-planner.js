const { pool } = require('./config/postgresql');

async function diagnoseJourneyPlannerIssue() {
  try {
    console.log('\n🔍 ========================================');
    console.log('🔍 JOURNEY PLANNER PROVIDER ISSUE DIAGNOSIS');
    console.log('🔍 ========================================\n');

    // 1. Check total services in database
    const allServices = await pool.query(`
      SELECT 
        s.id, s.title, s.category, s.region, s.district, s.area, 
        s.provider_id, s.is_active,
        sp.business_name, sp.business_type
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.created_at DESC
    `);
    
    console.log(`📊 TOTAL SERVICES IN DATABASE: ${allServices.rows.length}`);
    console.log(`📊 Active services: ${allServices.rows.filter(s => s.is_active).length}`);
    console.log(`📊 Inactive services: ${allServices.rows.filter(s => !s.is_active).length}\n`);

    // 2. Check services by category
    const categoryBreakdown = {};
    allServices.rows.forEach(s => {
      const cat = s.category || 'NO_CATEGORY';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });
    
    console.log('🏷️ SERVICES BY CATEGORY:');
    Object.entries(categoryBreakdown).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} services`);
    });
    console.log('');

    // 3. Check services by region
    const regionBreakdown = {};
    allServices.rows.forEach(s => {
      const region = s.region || 'NO_REGION';
      regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
    });
    
    console.log('📍 SERVICES BY REGION:');
    Object.entries(regionBreakdown).forEach(([region, count]) => {
      console.log(`   - ${region}: ${count} services`);
    });
    console.log('');

    // 4. Check services by district
    const districtBreakdown = {};
    allServices.rows.forEach(s => {
      if (s.district) {
        const key = `${s.region} - ${s.district}`;
        districtBreakdown[key] = (districtBreakdown[key] || 0) + 1;
      }
    });
    
    console.log('📍 SERVICES BY DISTRICT (Top 20):');
    Object.entries(districtBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([district, count]) => {
        console.log(`   - ${district}: ${count} services`);
      });
    console.log('');

    // 5. Show sample services with full location data
    console.log('📋 SAMPLE SERVICES (First 10 active):');
    allServices.rows
      .filter(s => s.is_active)
      .slice(0, 10)
      .forEach((s, idx) => {
        console.log(`\n   ${idx + 1}. "${s.title}"`);
        console.log(`      ID: ${s.id}`);
        console.log(`      Category: ${s.category || 'NONE'}`);
        console.log(`      Region: ${s.region || 'NONE'}`);
        console.log(`      District: ${s.district || 'NONE'}`);
        console.log(`      Area: ${s.area || 'NONE'}`);
        console.log(`      Provider ID: ${s.provider_id || 'NONE'}`);
        console.log(`      Provider: ${s.business_name || 'NONE'}`);
        console.log(`      Business Type: ${s.business_type || 'NONE'}`);
      });
    console.log('');

    // 6. Check providers
    const providers = await pool.query(`
      SELECT 
        sp.id, sp.business_name, sp.business_type, sp.region, sp.district, sp.area,
        sp.is_verified, sp.user_id,
        u.first_name, u.last_name, u.email, u.user_type
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
    `);
    
    console.log(`\n👥 TOTAL SERVICE PROVIDERS: ${providers.rows.length}`);
    console.log(`👥 Verified providers: ${providers.rows.filter(p => p.is_verified).length}`);
    console.log(`👥 Unverified providers: ${providers.rows.filter(p => !p.is_verified).length}\n`);

    // 7. Show sample providers
    console.log('📋 SAMPLE PROVIDERS (First 10):');
    providers.rows.slice(0, 10).forEach((p, idx) => {
      console.log(`\n   ${idx + 1}. "${p.business_name}"`);
      console.log(`      ID: ${p.id}`);
      console.log(`      Business Type: ${p.business_type || 'NONE'}`);
      console.log(`      Region: ${p.region || 'NONE'}`);
      console.log(`      District: ${p.district || 'NONE'}`);
      console.log(`      Area: ${p.area || 'NONE'}`);
      console.log(`      Verified: ${p.is_verified ? 'YES' : 'NO'}`);
      console.log(`      User: ${p.first_name} ${p.last_name} (${p.email})`);
      console.log(`      User Type: ${p.user_type}`);
    });
    console.log('');

    // 8. Test specific filtering scenarios
    console.log('\n🧪 TESTING FILTERING SCENARIOS:\n');

    // Test 1: Mbeya + Accommodation
    const mbeyaAccommodation = allServices.rows.filter(s => {
      const region = (s.region || '').toLowerCase().trim();
      const category = (s.category || '').toLowerCase().trim();
      return region === 'mbeya' && category === 'accommodation';
    });
    console.log(`Test 1: Mbeya + Accommodation`);
    console.log(`   Result: ${mbeyaAccommodation.length} services`);
    if (mbeyaAccommodation.length > 0) {
      mbeyaAccommodation.slice(0, 3).forEach(s => {
        console.log(`   - ${s.title} (${s.district || 'NO DISTRICT'})`);
      });
    }
    console.log('');

    // Test 2: Dar es Salaam + Transportation
    const darTransport = allServices.rows.filter(s => {
      const region = (s.region || '').toLowerCase().trim();
      const category = (s.category || '').toLowerCase().trim();
      return region === 'dar es salaam' && category === 'transportation';
    });
    console.log(`Test 2: Dar es Salaam + Transportation`);
    console.log(`   Result: ${darTransport.length} services`);
    if (darTransport.length > 0) {
      darTransport.slice(0, 3).forEach(s => {
        console.log(`   - ${s.title} (${s.district || 'NO DISTRICT'})`);
      });
    }
    console.log('');

    // Test 3: Arusha + Tours & Activities
    const arushaTours = allServices.rows.filter(s => {
      const region = (s.region || '').toLowerCase().trim();
      const category = (s.category || '').toLowerCase().trim();
      return region === 'arusha' && category.includes('tour');
    });
    console.log(`Test 3: Arusha + Tours & Activities`);
    console.log(`   Result: ${arushaTours.length} services`);
    if (arushaTours.length > 0) {
      arushaTours.slice(0, 3).forEach(s => {
        console.log(`   - ${s.title} (${s.district || 'NO DISTRICT'}, category: ${s.category})`);
      });
    }
    console.log('');

    // 9. Check service-provider relationships
    console.log('\n🔗 SERVICE-PROVIDER RELATIONSHIP CHECK:\n');
    const orphanedServices = allServices.rows.filter(s => !s.provider_id);
    const servicesWithInvalidProvider = allServices.rows.filter(s => {
      if (!s.provider_id) return false;
      return !providers.rows.find(p => p.id === s.provider_id);
    });

    console.log(`   ⚠️ Services without provider_id: ${orphanedServices.length}`);
    console.log(`   ⚠️ Services with invalid provider_id: ${servicesWithInvalidProvider.length}`);
    console.log(`   ✅ Services with valid provider: ${allServices.rows.length - orphanedServices.length - servicesWithInvalidProvider.length}`);
    console.log('');

    // 10. CRITICAL: Check exact category values
    console.log('\n🔍 EXACT CATEGORY VALUES IN DATABASE:\n');
    const uniqueCategories = [...new Set(allServices.rows.map(s => s.category))];
    uniqueCategories.forEach(cat => {
      const count = allServices.rows.filter(s => s.category === cat).length;
      console.log(`   "${cat}": ${count} services`);
    });
    console.log('');

    // 11. Simulate frontend filter request
    console.log('\n🎯 SIMULATING FRONTEND FILTER REQUEST:\n');
    const testFilters = [
      { region: 'Mbeya', district: null, category: 'Accommodation' },
      { region: 'Dar es Salaam', district: 'Ilala', category: 'Transportation' },
      { region: 'Arusha', district: null, category: 'Tours & Activities' },
    ];

    for (const filter of testFilters) {
      console.log(`\nFilter: Region="${filter.region}", District="${filter.district || 'ANY'}", Category="${filter.category}"`);
      
      let filtered = allServices.rows.filter(s => s.is_active);
      
      // Apply region filter
      if (filter.region) {
        const regionLower = filter.region.toLowerCase().trim();
        filtered = filtered.filter(s => {
          const serviceRegion = (s.region || '').toLowerCase().trim();
          return serviceRegion === regionLower;
        });
      }
      
      // Apply district filter
      if (filter.district) {
        const districtLower = filter.district.toLowerCase().trim();
        filtered = filtered.filter(s => {
          const serviceDistrict = (s.district || '').toLowerCase().trim();
          return serviceDistrict === districtLower || !serviceDistrict;
        });
      }
      
      // Apply category filter
      if (filter.category) {
        const categoryLower = filter.category.toLowerCase().trim();
        filtered = filtered.filter(s => {
          const serviceCategory = (s.category || '').toLowerCase().trim();
          return serviceCategory === categoryLower;
        });
      }
      
      console.log(`   → Result: ${filtered.length} services`);
      if (filtered.length > 0) {
        filtered.slice(0, 3).forEach(s => {
          console.log(`      - ${s.title} (Provider: ${s.business_name || 'NONE'})`);
        });
      } else {
        console.log(`      ❌ NO SERVICES FOUND!`);
        console.log(`      Available services in region "${filter.region}":`);
        const inRegion = allServices.rows.filter(s => {
          const serviceRegion = (s.region || '').toLowerCase().trim();
          return serviceRegion === (filter.region || '').toLowerCase().trim();
        });
        console.log(`         - Total in region: ${inRegion.length}`);
        const categories = [...new Set(inRegion.map(s => s.category))];
        console.log(`         - Categories available: ${categories.join(', ')}`);
      }
    }

    console.log('\n🔍 ========================================');
    console.log('🔍 DIAGNOSIS COMPLETE');
    console.log('🔍 ========================================\n');

  } catch (error) {
    console.error('❌ Diagnosis error:', error);
  } finally {
    await pool.end();
  }
}

diagnoseJourneyPlannerIssue();