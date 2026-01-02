const { pool } = require('./config/postgresql');

async function testJourneyPlannerFix() {
  try {
    console.log('\n🧪 ========================================');
    console.log('🧪 TESTING JOURNEY PLANNER FIX');
    console.log('🧪 ========================================\n');

    // Helper function for case-insensitive comparison
    const normalize = (str) => (str || '').toLowerCase().trim();

    // Fetch all active services
    const result = await pool.query(`
      SELECT 
        s.id, s.title, s.category, s.region, s.district, s.area, 
        s.provider_id, s.is_active,
        sp.business_name, sp.business_type
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `);

    const allServices = result.rows;
    console.log(`📊 Total active services: ${allServices.length}\n`);

    // Test scenarios that should work
    const testCases = [
      {
        name: 'Mbeya + Accommodation',
        location: { region: 'Mbeya', district: null, ward: null },
        categories: ['Accommodation']
      },
      {
        name: 'Mbeya + Mbeya Urban + Accommodation',
        location: { region: 'Mbeya', district: 'Mbeya Urban', ward: null },
        categories: ['Accommodation']
      },
      {
        name: 'Arusha + Tours & Activities',
        location: { region: 'Arusha', district: null, ward: null },
        categories: ['Tours & Activities']
      },
      {
        name: 'Mbeya + Multiple Categories',
        location: { region: 'Mbeya', district: null, ward: null },
        categories: ['Accommodation', 'Transportation', 'Tours & Activities']
      },
      {
        name: 'Case Insensitive: mbeya + accommodation',
        location: { region: 'mbeya', district: null, ward: null },
        categories: ['accommodation']
      },
      {
        name: 'Dar es Salaam + Any Category',
        location: { region: 'Dar es Salaam', district: null, ward: null },
        categories: []
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 TEST: ${testCase.name}`);
      console.log(`   Location: Region="${testCase.location.region}", District="${testCase.location.district || 'ANY'}", Ward="${testCase.location.ward || 'ANY'}"`);
      console.log(`   Categories: ${testCase.categories.length > 0 ? testCase.categories.join(', ') : 'ANY'}`);

      let filtered = allServices;

      // Apply location filter
      if (testCase.location.region || testCase.location.district || testCase.location.ward) {
        const searchRegion = normalize(testCase.location.region);
        const searchDistrict = normalize(testCase.location.district);
        const searchWard = normalize(testCase.location.ward);

        filtered = filtered.filter(service => {
          const serviceRegion = normalize(service.region);
          const serviceDistrict = normalize(service.district);
          const serviceArea = normalize(service.area);

          // Services without region cannot be matched
          if (!serviceRegion) return false;

          // Rule 1: Region MUST match
          if (searchRegion && serviceRegion !== searchRegion) {
            return false;
          }

          // Rule 2: District matching (hierarchical)
          if (searchDistrict) {
            const districtMatch = serviceDistrict === searchDistrict;
            const isRegionLevelService = !serviceDistrict;
            if (!districtMatch && !isRegionLevelService) {
              return false;
            }
          }

          // Rule 3: Ward/Area matching (hierarchical)
          if (searchWard) {
            const wardMatch = serviceArea === searchWard;
            const isDistrictLevelService = !serviceArea && serviceDistrict === searchDistrict;
            const isRegionLevelService = !serviceArea && !serviceDistrict;
            if (!wardMatch && !isDistrictLevelService && !isRegionLevelService) {
              return false;
            }
          }

          return true;
        });
      }

      // Apply category filter
      if (testCase.categories.length > 0) {
        const categoriesNormalized = testCase.categories.map(normalize);
        filtered = filtered.filter(service => {
          const serviceCategory = normalize(service.category);
          return categoriesNormalized.includes(serviceCategory);
        });
      }

      // Group by provider
      const providerMap = new Map();
      filtered.forEach(service => {
        const providerId = service.provider_id;
        if (!providerId) return;

        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            id: providerId,
            business_name: service.business_name,
            services: [service],
            service_count: 1
          });
        } else {
          const provider = providerMap.get(providerId);
          provider.services.push(service);
          provider.service_count++;
        }
      });

      const providers = Array.from(providerMap.values());

      console.log(`   ✅ Result: ${providers.length} provider(s), ${filtered.length} service(s)`);
      
      if (providers.length > 0) {
        providers.forEach(p => {
          console.log(`      → ${p.business_name}: ${p.service_count} service(s)`);
          p.services.slice(0, 3).forEach(s => {
            console.log(`         - ${s.title} (${s.category})`);
          });
        });
      } else {
        console.log(`      ❌ NO PROVIDERS FOUND`);
        
        // Debug: show what's available in the region
        const inRegion = allServices.filter(s => 
          normalize(s.region) === normalize(testCase.location.region)
        );
        if (inRegion.length > 0) {
          console.log(`      💡 Available in region "${testCase.location.region}":`);
          const categories = [...new Set(inRegion.map(s => s.category))];
          console.log(`         Categories: ${categories.join(', ')}`);
          const districts = [...new Set(inRegion.map(s => s.district).filter(Boolean))];
          console.log(`         Districts: ${districts.join(', ') || 'None'}`);
        }
      }
    }

    console.log('\n🧪 ========================================');
    console.log('🧪 ALL TESTS COMPLETE');
    console.log('🧪 ========================================\n');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await pool.end();
  }
}

testJourneyPlannerFix();