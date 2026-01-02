require('dotenv').config({ path: __dirname + '/.env' });
const { Service } = require('./models');

async function testFiltering() {
  try {
    console.log('🧪 TESTING SERVICE FILTERING...\n');
    
    // Test 1: Filter by category only
    console.log('TEST 1: Filter by category "Accommodation"');
    console.log('─'.repeat(80));
    const services = await Service.findWithProvider({ is_active: true });
    const accommodationServices = services.filter(s => s.category === 'Accommodation');
    console.log(`Total services: ${services.length}`);
    console.log(`Accommodation services: ${accommodationServices.length}`);
    accommodationServices.forEach(s => {
      console.log(`  - ${s.title} (${s.location}, ${s.district}, ${s.region})`);
    });
    
    // Test 2: Filter by location "Arusha Central"
    console.log('\n\nTEST 2: Filter by location "Arusha Central"');
    console.log('─'.repeat(80));
    const arushaServices = services.filter(s => {
      const serviceLocation = (s.location || '').toLowerCase().trim();
      const serviceArea = (s.area || '').toLowerCase().trim();
      const locationLower = 'arusha central';
      
      return serviceLocation === locationLower ||
             serviceArea === locationLower ||
             serviceLocation.includes(locationLower) ||
             serviceArea.includes(locationLower);
    });
    console.log(`Services in Arusha Central: ${arushaServices.length}`);
    arushaServices.forEach(s => {
      console.log(`  - ${s.title} (${s.category})`);
    });
    
    // Test 3: Filter by category AND location
    console.log('\n\nTEST 3: Filter by category "Accommodation" AND location "Arusha Central"');
    console.log('─'.repeat(80));
    const filteredServices = services.filter(s => {
      // Category filter
      if (s.category !== 'Accommodation') return false;
      
      // Location filter
      const serviceLocation = (s.location || '').toLowerCase().trim();
      const serviceArea = (s.area || '').toLowerCase().trim();
      const locationLower = 'arusha central';
      
      return serviceLocation === locationLower ||
             serviceArea === locationLower ||
             serviceLocation.includes(locationLower) ||
             serviceArea.includes(locationLower);
    });
    console.log(`Filtered services: ${filteredServices.length}`);
    filteredServices.forEach(s => {
      console.log(`  - ${s.title} (${s.location}, ${s.district}, ${s.region})`);
    });
    
    // Test 4: Filter by category "Food & Dining" AND region "Zanzibar"
    console.log('\n\nTEST 4: Filter by category "Food & Dining" AND region "Zanzibar"');
    console.log('─'.repeat(80));
    const zanzibarFood = services.filter(s => {
      // Category filter
      if (s.category !== 'Food & Dining') return false;
      
      // Region filter
      const serviceRegion = (s.region || '').toLowerCase().trim();
      const regionLower = 'zanzibar';
      
      return serviceRegion === regionLower ||
             serviceRegion.includes(regionLower);
    });
    console.log(`Filtered services: ${zanzibarFood.length}`);
    zanzibarFood.forEach(s => {
      console.log(`  - ${s.title} (${s.location}, ${s.district}, ${s.region})`);
    });
    
    // Test 5: What user is experiencing - wrong category
    console.log('\n\nTEST 5: User selects "Transportation" in "Zanzibar" (should be 0)');
    console.log('─'.repeat(80));
    const wrongFilter = services.filter(s => {
      // Category filter
      if (s.category !== 'Transportation') return false;
      
      // Region filter
      const serviceRegion = (s.region || '').toLowerCase().trim();
      const regionLower = 'zanzibar';
      
      return serviceRegion === regionLower ||
             serviceRegion.includes(regionLower);
    });
    console.log(`Filtered services: ${wrongFilter.length}`);
    if (wrongFilter.length === 0) {
      console.log('  ✅ CORRECT: No Transportation services in Zanzibar');
    } else {
      console.log('  ❌ ERROR: Found services that should not match!');
      wrongFilter.forEach(s => {
        console.log(`  - ${s.title} (${s.location}, ${s.district}, ${s.region})`);
      });
    }
    
    console.log('\n\n✅ FILTERING TESTS COMPLETE!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFiltering();
