const { pool } = require('./config/postgresql');

async function testMbeyaProviders() {
  try {
    console.log('\n🧪 TESTING MBEYA PROVIDERS - SIMULATING FRONTEND REQUEST\n');
    
    // Test 1: Mbeya → Mbeya City → Mbeya CBD (Accommodation)
    console.log('Test 1: Accommodation in Mbeya → Mbeya City → Mbeya CBD');
    console.log('-------------------------------------------------------');
    
    const region = 'Mbeya';
    const district = 'Mbeya City';
    const area = 'Mbeya CBD';
    const category = 'Accommodation';
    
    // Get all active services
    const allServices = await pool.query(`
      SELECT s.*, sp.business_name 
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
    `);
    
    console.log(`Total active services: ${allServices.rows.length}`);
    
    // Apply filters (same logic as backend route)
    let filtered = allServices.rows;
    
    // Filter by category (case-insensitive)
    if (category) {
      const categoryLower = category.toLowerCase().trim();
      filtered = filtered.filter(s => {
        const serviceCategory = (s.category || '').toLowerCase().trim();
        return serviceCategory === categoryLower;
      });
      console.log(`After category filter "${category}": ${filtered.length} services`);
    }
    
    // Filter by location (hierarchical)
    if (region || district || area) {
      const normalize = (str) => (str || '').toLowerCase().trim();
      
      filtered = filtered.filter(s => {
        const serviceRegion = normalize(s.region);
        const serviceDistrict = normalize(s.district);
        const serviceArea = normalize(s.area);
        
        const searchRegion = normalize(region);
        const searchDistrict = normalize(district);
        const searchArea = normalize(area);
        
        // Region must match
        if (searchRegion && serviceRegion !== searchRegion) {
          return false;
        }
        
        // District hierarchical match
        if (searchDistrict) {
          const districtMatch = serviceDistrict === searchDistrict;
          const regionLevelService = !serviceDistrict;
          if (!districtMatch && !regionLevelService) {
            return false;
          }
        }
        
        // Area hierarchical match
        if (searchArea) {
          const areaMatch = serviceArea === searchArea;
          const districtLevelService = !serviceArea && serviceDistrict === searchDistrict;
          const regionLevelService = !serviceArea && !serviceDistrict;
          if (!areaMatch && !districtLevelService && !regionLevelService) {
            return false;
          }
        }
        
        return true;
      });
      
      console.log(`After location filter (${region} → ${district} → ${area}): ${filtered.length} services`);
    }
    
    console.log('\n📋 Results:');
    if (filtered.length === 0) {
      console.log('  ❌ NO PROVIDERS FOUND (This is the bug!)');
    } else {
      console.log(`  ✅ Found ${filtered.length} provider(s):\n`);
      filtered.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.title}`);
        console.log(`     Category: ${s.category}`);
        console.log(`     Location: ${s.region} → ${s.district} → ${s.area}`);
        console.log(`     Provider: ${s.business_name}`);
        console.log('');
      });
    }
    
    // Test 2: Mbeya → Mbeya City → Iyunga (Accommodation)
    console.log('\n\nTest 2: Accommodation in Mbeya → Mbeya City → Iyunga');
    console.log('-------------------------------------------------------');
    
    const area2 = 'Iyunga';
    filtered = allServices.rows;
    
    // Category filter
    filtered = filtered.filter(s => {
      const serviceCategory = (s.category || '').toLowerCase().trim();
      return serviceCategory === category.toLowerCase().trim();
    });
    
    // Location filter
    const normalize = (str) => (str || '').toLowerCase().trim();
    filtered = filtered.filter(s => {
      const serviceRegion = normalize(s.region);
      const serviceDistrict = normalize(s.district);
      const serviceArea = normalize(s.area);
      
      if (normalize(region) && serviceRegion !== normalize(region)) return false;
      if (normalize(district)) {
        const districtMatch = serviceDistrict === normalize(district);
        const regionLevelService = !serviceDistrict;
        if (!districtMatch && !regionLevelService) return false;
      }
      if (normalize(area2)) {
        const areaMatch = serviceArea === normalize(area2);
        const districtLevelService = !serviceArea && serviceDistrict === normalize(district);
        const regionLevelService = !serviceArea && !serviceDistrict;
        if (!areaMatch && !districtLevelService && !regionLevelService) return false;
      }
      
      return true;
    });
    
    console.log(`Found ${filtered.length} services in Iyunga`);
    filtered.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.title} (${s.business_name})`);
    });
    
    // Test 3: Transportation in Mbeya City
    console.log('\n\nTest 3: Transportation in Mbeya → Mbeya City → Mbeya CBD');
    console.log('-------------------------------------------------------');
    
    const category3 = 'Transportation';
    filtered = allServices.rows;
    
    filtered = filtered.filter(s => {
      const serviceCategory = (s.category || '').toLowerCase().trim();
      return serviceCategory === category3.toLowerCase().trim();
    });
    
    filtered = filtered.filter(s => {
      const serviceRegion = normalize(s.region);
      const serviceDistrict = normalize(s.district);
      const serviceArea = normalize(s.area);
      
      if (normalize(region) && serviceRegion !== normalize(region)) return false;
      if (normalize(district)) {
        const districtMatch = serviceDistrict === normalize(district);
        const regionLevelService = !serviceDistrict;
        if (!districtMatch && !regionLevelService) return false;
      }
      if (normalize(area)) {
        const areaMatch = serviceArea === normalize(area);
        const districtLevelService = !serviceArea && serviceDistrict === normalize(district);
        const regionLevelService = !serviceArea && !serviceDistrict;
        if (!areaMatch && !districtLevelService && !regionLevelService) return false;
      }
      
      return true;
    });
    
    console.log(`Found ${filtered.length} transportation services`);
    filtered.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.title} (${s.business_name})`);
    });
    
    console.log('\n✅ Tests complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testMbeyaProviders();