// Test live API on Render
const axios = require('axios');
const LIVE_API = 'https://isafarinetworkglobal-2.onrender.com/api';

async function testLiveAPI() {
  console.log('🌐 TESTING LIVE API ON RENDER...\n');
  console.log(`API URL: ${LIVE_API}\n`);
  
  try {
    // Test 1: Get all services
    console.log('TEST 1: Get all services');
    console.log('─'.repeat(80));
    const response1 = await axios.get(`${LIVE_API}/services?limit=100`);
    const data1 = response1.data;
    console.log(`Status: ${response1.status}`);
    console.log(`Total services: ${data1.services?.length || 0}`);
    console.log(`Categories:`, [...new Set(data1.services?.map(s => s.category) || [])]);
    
    // Test 2: Filter by category "Accommodation"
    console.log('\n\nTEST 2: Filter by category "Accommodation"');
    console.log('─'.repeat(80));
    const response2 = await axios.get(`${LIVE_API}/services?category=Accommodation&limit=100`);
    const data2 = response2.data;
    console.log(`Status: ${response2.status}`);
    console.log(`Filtered services: ${data2.services?.length || 0}`);
    data2.services?.forEach(s => {
      console.log(`  - ${s.title} (${s.location}, ${s.district}, ${s.region})`);
    });
    
    // Test 3: Filter by category AND location
    console.log('\n\nTEST 3: Filter by category "Accommodation" AND location "Arusha Central"');
    console.log('─'.repeat(80));
    const response3 = await axios.get(`${LIVE_API}/services?category=Accommodation&location=Arusha Central&limit=100`);
    const data3 = response3.data;
    console.log(`Status: ${response3.status}`);
    console.log(`Filtered services: ${data3.services?.length || 0}`);
    console.log(`Location filter applied: ${data3.locationFilterApplied}`);
    data3.services?.forEach(s => {
      console.log(`  - ${s.title} (${s.location}, ${s.district}, ${s.region})`);
    });
    
    // Test 4: Filter by wrong combination (should return 0)
    console.log('\n\nTEST 4: Filter by category "Transportation" AND region "Zanzibar" (should be 0)');
    console.log('─'.repeat(80));
    const response4 = await axios.get(`${LIVE_API}/services?category=Transportation&region=Zanzibar&limit=100`);
    const data4 = response4.data;
    console.log(`Status: ${response4.status}`);
    console.log(`Filtered services: ${data4.services?.length || 0}`);
    console.log(`Location filter applied: ${data4.locationFilterApplied}`);
    if (data4.services?.length === 0) {
      console.log('  ✅ CORRECT: No Transportation services in Zanzibar');
    } else {
      console.log('  ❌ ERROR: Found services that should not match!');
      data4.services?.forEach(s => {
        console.log(`  - ${s.title} (${s.category}, ${s.location}, ${s.region})`);
      });
    }
    
    // Test 5: Check if backend has the filtering code
    console.log('\n\nTEST 5: Verify backend filtering logic is deployed');
    console.log('─'.repeat(80));
    const response5 = await axios.get(`${LIVE_API}/services?category=Food & Dining&region=Zanzibar&limit=100`);
    const data5 = response5.data;
    console.log(`Status: ${response5.status}`);
    console.log(`Filtered services: ${data5.services?.length || 0}`);
    console.log(`Filters applied:`, data5.filters);
    console.log(`Location filter applied: ${data5.locationFilterApplied}`);
    
    if (data5.filters && data5.locationFilterApplied !== undefined) {
      console.log('  ✅ Backend has NEW filtering code deployed!');
    } else {
      console.log('  ❌ Backend still has OLD code - filtering not deployed!');
    }
    
    console.log('\n\n✅ LIVE API TESTS COMPLETE!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLiveAPI();
