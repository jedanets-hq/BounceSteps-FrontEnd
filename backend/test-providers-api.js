// Test script to verify backend API returns providers correctly
// Run: node test-providers-api.js

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

const testCases = [
  {
    name: 'Test 1: All services',
    url: `${API_URL}/services?limit=10`,
    expectedMinResults: 1
  },
  {
    name: 'Test 2: Accommodation in Mbeya',
    url: `${API_URL}/services?category=Accommodation&region=Mbeya&limit=10`,
    expectedMinResults: 1
  },
  {
    name: 'Test 3: Transportation in Mbeya',
    url: `${API_URL}/services?category=Transportation&region=Mbeya&limit=10`,
    expectedMinResults: 0 // May not have transportation services
  },
  {
    name: 'Test 4: Tours & Activities in Mbeya',
    url: `${API_URL}/services?category=Tours & Activities&region=Mbeya&limit=10`,
    expectedMinResults: 0 // May not have tours
  },
  {
    name: 'Test 5: All categories in Dar es Salaam',
    url: `${API_URL}/services?region=Dar es Salaam&limit=10`,
    expectedMinResults: 0 // May not have services in Dar
  }
];

async function testAPI(testCase) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 ${testCase.name}`);
  console.log('='.repeat(80));
  console.log(`📍 URL: ${testCase.url}`);
  console.log('');
  
  try {
    const startTime = Date.now();
    const response = await fetch(testCase.url, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ FAILED: HTTP ${response.status}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
      return false;
    }
    
    const data = await response.json();
    
    console.log(`✅ Success: ${data.success}`);
    console.log(`📦 Total services: ${data.total || 0}`);
    console.log(`📄 Services in response: ${data.services?.length || 0}`);
    
    if (data.filters) {
      console.log(`🔍 Filters applied:`, data.filters);
    }
    
    if (data.services && data.services.length > 0) {
      console.log('\n📋 Services found:');
      data.services.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title}`);
        console.log(`      Category: ${service.category}`);
        console.log(`      Location: ${service.region || 'N/A'} > ${service.district || 'N/A'} > ${service.area || 'N/A'}`);
        console.log(`      Provider: ${service.business_name || service.provider_name || 'N/A'}`);
        console.log(`      Price: TZS ${service.price}`);
        console.log(`      Verified: ${service.provider_verified ? '✓' : '✗'}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No services found');
      
      if (testCase.expectedMinResults > 0) {
        console.log(`❌ FAILED: Expected at least ${testCase.expectedMinResults} results`);
        return false;
      }
    }
    
    if (data.services && data.services.length >= testCase.expectedMinResults) {
      console.log(`✅ PASSED: Found ${data.services.length} services (expected >= ${testCase.expectedMinResults})`);
      return true;
    } else {
      console.log(`⚠️  WARNING: Found ${data.services?.length || 0} services (expected >= ${testCase.expectedMinResults})`);
      return testCase.expectedMinResults === 0;
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'iSafari API Provider Test Suite' + ' '.repeat(26) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('');
  console.log(`🌐 Testing API: ${API_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  
  const results = [];
  
  for (const testCase of testCases) {
    const passed = await testAPI(testCase);
    results.push({ name: testCase.name, passed });
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log('');
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed} (${Math.round(passed/results.length*100)}%)`);
  console.log(`Failed: ${failed} (${Math.round(failed/results.length*100)}%)`);
  console.log('');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Backend API is working correctly');
    console.log('✅ Providers should appear in Journey Planner Step 4');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('❌ Check backend logs for errors');
    console.log('❌ Verify database has services with correct location data');
  }
  
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. If tests passed: Deploy frontend with cache busting');
  console.log('   2. If tests failed: Check backend logs and database');
  console.log('   3. Test in browser: https://isafari-tz.netlify.app/journey-planner');
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
