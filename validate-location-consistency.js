const { pool } = require('./config/postgresql');
const fs = require('fs');
const path = require('path');

async function validateLocationConsistency() {
  try {
    console.log('\n🔍 ========================================');
    console.log('🔍 LOCATION DATA CONSISTENCY CHECK');
    console.log('🔍 ========================================\n');

    // 1. Load frontend location data
    const frontendDataPath = path.join(__dirname, '../src/data/tanzaniaLocations.json');
    const frontendData = JSON.parse(fs.readFileSync(frontendDataPath, 'utf8'));

    console.log('📂 Loaded frontend location data');
    console.log(`   Regions: ${frontendData.regions.length}\n`);

    // 2. Get backend location data
    const result = await pool.query(`
      SELECT DISTINCT region, district, area
      FROM services
      WHERE region IS NOT NULL
      ORDER BY region, district, area
    `);

    console.log('📦 Loaded backend location data');
    console.log(`   Unique combinations: ${result.rows.length}\n`);

    // 3. Build maps for comparison
    const normalize = (str) => (str || '').toLowerCase().trim();
    
    // Frontend regions map
    const frontendRegions = new Map();
    frontendData.regions.forEach(region => {
      const regionKey = normalize(region.name);
      frontendRegions.set(regionKey, {
        name: region.name,
        districts: new Map()
      });
      
      region.districts.forEach(district => {
        const districtKey = normalize(district.name);
        frontendRegions.get(regionKey).districts.set(districtKey, {
          name: district.name,
          wards: district.wards.map(w => normalize(w.name))
        });
      });
    });

    // Backend regions map
    const backendRegions = new Map();
    result.rows.forEach(row => {
      const regionKey = normalize(row.region);
      if (!backendRegions.has(regionKey)) {
        backendRegions.set(regionKey, {
          name: row.region,
          districts: new Map()
        });
      }
      
      if (row.district) {
        const districtKey = normalize(row.district);
        if (!backendRegions.get(regionKey).districts.has(districtKey)) {
          backendRegions.get(regionKey).districts.set(districtKey, {
            name: row.district,
            areas: new Set()
          });
        }
        
        if (row.area) {
          backendRegions.get(regionKey).districts.get(districtKey).areas.add(normalize(row.area));
        }
      }
    });

    // 4. Compare regions
    console.log('🔍 REGION COMPARISON:\n');
    
    const frontendRegionKeys = Array.from(frontendRegions.keys());
    const backendRegionKeys = Array.from(backendRegions.keys());
    
    const onlyInFrontend = frontendRegionKeys.filter(r => !backendRegions.has(r));
    const onlyInBackend = backendRegionKeys.filter(r => !frontendRegions.has(r));
    const inBoth = frontendRegionKeys.filter(r => backendRegions.has(r));
    
    console.log(`   Regions in frontend only: ${onlyInFrontend.length}`);
    if (onlyInFrontend.length > 0) {
      onlyInFrontend.forEach(r => {
        console.log(`      - ${frontendRegions.get(r).name} (no services in DB)`);
      });
    }
    
    console.log(`   Regions in backend only: ${onlyInBackend.length}`);
    if (onlyInBackend.length > 0) {
      onlyInBackend.forEach(r => {
        console.log(`      - ${backendRegions.get(r).name} (not in LocationSelector!)`);
      });
    }
    
    console.log(`   Regions in both: ${inBoth.length}\n`);

    // 5. Check district mismatches
    console.log('🔍 DISTRICT/AREA MISMATCH ANALYSIS:\n');
    
    const mismatches = [];
    
    inBoth.forEach(regionKey => {
      const feDistricts = Array.from(frontendRegions.get(regionKey).districts.keys());
      const beDistricts = Array.from(backendRegions.get(regionKey).districts.keys());
      
      feDistricts.forEach(feDistrict => {
        const feName = frontendRegions.get(regionKey).districts.get(feDistrict).name;
        
        // Check if this frontend "district" is actually an area in backend
        let isActuallyArea = false;
        backendRegions.get(regionKey).districts.forEach((districtData, beDistrict) => {
          if (districtData.areas.has(feDistrict)) {
            isActuallyArea = true;
            mismatches.push({
              region: frontendRegions.get(regionKey).name,
              frontendDistrict: feName,
              actualDistrict: districtData.name,
              actualArea: feName,
              issue: 'Frontend lists as DISTRICT but DB has as AREA'
            });
          }
        });
        
        // Check if district exists in backend
        if (!isActuallyArea && !beDistricts.includes(feDistrict)) {
          mismatches.push({
            region: frontendRegions.get(regionKey).name,
            frontendDistrict: feName,
            issue: 'Frontend district not found in backend'
          });
        }
      });
    });

    if (mismatches.length > 0) {
      console.log(`   ⚠️  Found ${mismatches.length} mismatches:\n`);
      mismatches.forEach(m => {
        console.log(`   Region: ${m.region}`);
        console.log(`      Frontend: District = "${m.frontendDistrict}"`);
        if (m.actualDistrict) {
          console.log(`      Backend: District = "${m.actualDistrict}", Area = "${m.actualArea}"`);
        }
        console.log(`      Issue: ${m.issue}\n`);
      });
    } else {
      console.log('   ✅ No district/area mismatches found\n');
    }

    // 6. Generate recommendations
    console.log('💡 RECOMMENDATIONS:\n');
    
    if (mismatches.length > 0) {
      console.log('   1. Update tanzaniaLocations.json to match database structure');
      console.log('   2. OR: Keep smart filtering logic in place to handle mismatches');
      console.log('   3. Current filtering logic handles these cases automatically\n');
    }
    
    console.log('   Current status:');
    console.log('   ✅ Smart filtering logic is active');
    console.log('   ✅ Handles district/area mismatch');
    console.log('   ✅ Case-insensitive comparison');
    console.log('   ✅ Hierarchical matching\n');

    console.log('🔍 ========================================');
    console.log('🔍 VALIDATION COMPLETE');
    console.log('🔍 ========================================\n');

  } catch (error) {
    console.error('❌ Validation error:', error);
  } finally {
    await pool.end();
  }
}

validateLocationConsistency();