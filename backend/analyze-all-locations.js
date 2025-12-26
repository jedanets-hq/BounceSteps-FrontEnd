const { pool } = require('./config/postgresql');

async function analyzeAllLocations() {
  try {
    console.log('\n🔍 ========================================');
    console.log('🔍 DEEP ANALYSIS: ALL LOCATION DATA');
    console.log('🔍 ========================================\n');

    // Get ALL services with location data
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.region,
        s.district,
        s.area,
        sp.business_name,
        sp.region as provider_region,
        sp.district as provider_district,
        sp.area as provider_area
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.region, s.district, s.area
    `);

    console.log(`📊 TOTAL SERVICES: ${result.rows.length}\n`);

    // 1. Check for NULL or empty location fields
    console.log('🔍 CHECKING FOR MISSING LOCATION DATA:\n');
    
    const missingRegion = result.rows.filter(s => !s.region);
    const missingDistrict = result.rows.filter(s => !s.district);
    const missingArea = result.rows.filter(s => !s.area);
    
    console.log(`   Services without region: ${missingRegion.length}`);
    if (missingRegion.length > 0) {
      console.log('   ❌ CRITICAL: Services must have region!');
      missingRegion.forEach(s => {
        console.log(`      - "${s.title}" (ID: ${s.id})`);
      });
    }
    
    console.log(`   Services without district: ${missingDistrict.length}`);
    if (missingDistrict.length > 0) {
      console.log('   ⚠️  These are region-level services (OK)');
    }
    
    console.log(`   Services without area: ${missingArea.length}`);
    if (missingArea.length > 0) {
      console.log('   ⚠️  These are district-level services (OK)');
    }
    console.log('');

    // 2. Analyze unique location combinations
    console.log('🗺️  UNIQUE LOCATION COMBINATIONS:\n');
    
    const locationCombos = new Map();
    result.rows.forEach(s => {
      const combo = `${s.region || 'NULL'} → ${s.district || 'NULL'} → ${s.area || 'NULL'}`;
      if (!locationCombos.has(combo)) {
        locationCombos.set(combo, []);
      }
      locationCombos.get(combo).push(s);
    });

    console.log(`   Total unique combinations: ${locationCombos.size}\n`);
    
    // Sort by count
    const sortedCombos = Array.from(locationCombos.entries())
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedCombos.forEach(([combo, services]) => {
      console.log(`   ${combo} (${services.length} services)`);
    });
    console.log('');

    // 3. Check for inconsistencies
    console.log('🔍 CHECKING FOR LOCATION INCONSISTENCIES:\n');
    
    // Check if district appears as area in other services
    const allDistricts = new Set(result.rows.map(s => s.district).filter(Boolean));
    const allAreas = new Set(result.rows.map(s => s.area).filter(Boolean));
    
    const districtAsArea = [];
    allDistricts.forEach(district => {
      if (allAreas.has(district)) {
        districtAsArea.push(district);
      }
    });
    
    if (districtAsArea.length > 0) {
      console.log('   ⚠️  FOUND: Values appearing as both DISTRICT and AREA:');
      districtAsArea.forEach(value => {
        const asDistrict = result.rows.filter(s => s.district === value);
        const asArea = result.rows.filter(s => s.area === value);
        console.log(`      "${value}":`);
        console.log(`         - As district: ${asDistrict.length} services`);
        console.log(`         - As area: ${asArea.length} services`);
        console.log(`         Example services:`);
        if (asDistrict.length > 0) {
          console.log(`            District: "${asDistrict[0].title}" (${asDistrict[0].region})`);
        }
        if (asArea.length > 0) {
          console.log(`            Area: "${asArea[0].title}" (${asArea[0].region} → ${asArea[0].district})`);
        }
      });
      console.log('');
    } else {
      console.log('   ✅ No overlapping district/area values\n');
    }

    // 4. Check service-provider location mismatch
    console.log('🔍 CHECKING SERVICE vs PROVIDER LOCATION MISMATCH:\n');
    
    const mismatches = result.rows.filter(s => {
      if (!s.provider_region) return false; // Provider might not have location set
      return s.region !== s.provider_region || 
             s.district !== s.provider_district || 
             s.area !== s.provider_area;
    });
    
    if (mismatches.length > 0) {
      console.log(`   ⚠️  Found ${mismatches.length} services with different location than provider:`);
      mismatches.slice(0, 5).forEach(s => {
        console.log(`      Service: "${s.title}"`);
        console.log(`         Service location: ${s.region} → ${s.district} → ${s.area}`);
        console.log(`         Provider location: ${s.provider_region} → ${s.provider_district} → ${s.provider_area}`);
      });
      if (mismatches.length > 5) {
        console.log(`      ... and ${mismatches.length - 5} more`);
      }
      console.log('   ℹ️  This is OK - services can be in different locations than provider HQ\n');
    } else {
      console.log('   ✅ All services match provider location\n');
    }

    // 5. Analyze by region
    console.log('📍 SERVICES BY REGION (with hierarchy):\n');
    
    const byRegion = new Map();
    result.rows.forEach(s => {
      const region = s.region || 'NO_REGION';
      if (!byRegion.has(region)) {
        byRegion.set(region, { total: 0, districts: new Map() });
      }
      byRegion.get(region).total++;
      
      const district = s.district || 'REGION_LEVEL';
      if (!byRegion.get(region).districts.has(district)) {
        byRegion.get(region).districts.set(district, { total: 0, areas: new Set() });
      }
      byRegion.get(region).districts.get(district).total++;
      
      if (s.area) {
        byRegion.get(region).districts.get(district).areas.add(s.area);
      }
    });

    Array.from(byRegion.entries()).sort((a, b) => b[1].total - a[1].total).forEach(([region, data]) => {
      console.log(`   ${region} (${data.total} services)`);
      
      Array.from(data.districts.entries()).forEach(([district, districtData]) => {
        console.log(`      → ${district} (${districtData.total} services)`);
        if (districtData.areas.size > 0) {
          console.log(`         Areas: ${Array.from(districtData.areas).join(', ')}`);
        }
      });
    });
    console.log('');

    // 6. Test filtering scenarios
    console.log('🧪 TESTING FILTERING SCENARIOS:\n');
    
    const testCases = [
      { region: 'Mbeya', district: 'Mbeya Urban', area: 'Mbeya CBD' },
      { region: 'Mbeya', district: 'Mbeya CBD', area: null }, // User might select this wrong
      { region: 'Arusha', district: 'Arusha City', area: null },
      { region: 'Dar es Salaam', district: 'Ilala', area: null },
      { region: 'Zanzibar', district: 'Zanzibar City', area: null },
    ];

    testCases.forEach(test => {
      const normalize = (str) => (str || '').toLowerCase().trim();
      const searchRegion = normalize(test.region);
      const searchDistrict = normalize(test.district);
      const searchArea = normalize(test.area);

      const matches = result.rows.filter(s => {
        const serviceRegion = normalize(s.region);
        const serviceDistrict = normalize(s.district);
        const serviceArea = normalize(s.area);

        if (!serviceRegion) return false;
        if (searchRegion && serviceRegion !== searchRegion) return false;

        // Try matching district against both district AND area fields
        if (searchDistrict) {
          const districtMatch = serviceDistrict === searchDistrict;
          const areaMatch = serviceArea === searchDistrict;
          const regionLevel = !serviceDistrict && !serviceArea;
          if (!districtMatch && !areaMatch && !regionLevel) return false;
        }

        if (searchArea) {
          const areaMatch = serviceArea === searchArea;
          const districtLevel = !serviceArea && (serviceDistrict === searchDistrict || serviceDistrict === searchArea);
          const regionLevel = !serviceArea && !serviceDistrict;
          if (!areaMatch && !districtLevel && !regionLevel) return false;
        }

        return true;
      });

      console.log(`   Test: ${test.region} → ${test.district || 'ANY'} → ${test.area || 'ANY'}`);
      console.log(`      Result: ${matches.length} services`);
      if (matches.length > 0) {
        console.log(`      ✅ WORKING`);
      } else {
        console.log(`      ❌ NO MATCHES - might be an issue!`);
      }
    });
    console.log('');

    console.log('🔍 ========================================');
    console.log('🔍 ANALYSIS COMPLETE');
    console.log('🔍 ========================================\n');

    console.log('💡 RECOMMENDATIONS:');
    console.log('   1. Ensure all services have region set (mandatory)');
    console.log('   2. District and area are optional (hierarchical)');
    console.log('   3. Frontend filtering should match against BOTH district AND area fields');
    console.log('   4. Use case-insensitive comparison everywhere');
    console.log('   5. Document that area names might overlap with district names\n');

  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await pool.end();
  }
}

analyzeAllLocations();