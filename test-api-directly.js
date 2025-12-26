const http = require('http');

async function testAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING API DIRECTLY');
  console.log('='.repeat(60));

  // Test 1: Get all services in Mbeya
  console.log('\n🔍 Test 1: All services in Mbeya');
  await makeRequest('/api/services?region=Mbeya');

  // Test 2: Get accommodation services in Mbeya
  console.log('\n🔍 Test 2: Accommodation services in Mbeya');
  await makeRequest('/api/services?region=Mbeya&category=Accommodation');

  // Test 3: Get accommodation services in Mbeya (lowercase)
  console.log('\n🔍 Test 3: Accommodation services in Mbeya (lowercase category)');
  await makeRequest('/api/services?region=Mbeya&category=accommodation');

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60) + '\n');
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Services found: ${json.services?.length || 0}`);
          
          if (json.services && json.services.length > 0) {
            console.log(`  Services:`);
            json.services.forEach(s => {
              console.log(`    - ${s.title} (${s.category}) | Provider: ${s.business_name}`);
            });
          }
          
          resolve(json);
        } catch (e) {
          console.error(`  Error parsing response: ${e.message}`);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`  Request error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

testAPI().catch(console.error);
