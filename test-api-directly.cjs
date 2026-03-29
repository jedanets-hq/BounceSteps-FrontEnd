const http = require('http');

// Test API endpoint directly
const testAPI = (url, description) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   ✅ Status: ${res.statusCode}`);
          console.log(`   📦 Services found: ${json.services?.length || 0}`);
          
          if (json.services && json.services.length > 0) {
            console.log(`   📋 First 3 services:`);
            json.services.slice(0, 3).forEach((s, i) => {
              console.log(`      ${i + 1}. ${s.title} (${s.category})`);
              console.log(`         Provider: ${s.business_name}`);
              console.log(`         Location: ${s.area || 'N/A'}, ${s.district}, ${s.region}`);
            });
          }
          
          resolve(json);
        } catch (e) {
          console.log(`   ❌ Error parsing JSON:`, e.message);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Request error:`, err.message);
      reject(err);
    });
  });
};

async function runTests() {
  try {
    // Test 1: All services
    await testAPI(
      'http://localhost:5000/api/services?limit=10',
      'Get all services (limit 10)'
    );
    
    // Test 2: Filter by region
    await testAPI(
      'http://localhost:5000/api/services?region=Dar%20es%20Salaam&limit=10',
      'Filter by region (Dar es Salaam)'
    );
    
    // Test 3: Filter by region and category
    await testAPI(
      'http://localhost:5000/api/services?region=Dar%20es%20Salaam&category=Accommodation&limit=10',
      'Filter by region and category (Dar es Salaam, Accommodation)'
    );
    
    // Test 4: Filter by region, district, and category
    await testAPI(
      'http://localhost:5000/api/services?region=Dar%20es%20Salaam&district=Ilala&category=Accommodation&limit=10',
      'Filter by region, district, and category (Dar es Salaam, Ilala, Accommodation)'
    );
    
    // Test 5: Filter by region, district, area, and category
    await testAPI(
      'http://localhost:5000/api/services?region=Dar%20es%20Salaam&district=Ilala&area=Kariakoo&category=Accommodation&limit=10',
      'Filter by region, district, area, and category (Dar es Salaam, Ilala, Kariakoo, Accommodation)'
    );
    
    console.log('\n✅ All tests complete!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();
