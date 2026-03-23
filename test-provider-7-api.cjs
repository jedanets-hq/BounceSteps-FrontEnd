const http = require('http');

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
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
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Provider 7 API...\n');
  
  try {
    // Test 1: Get provider 7
    console.log('📡 Test 1: GET /api/providers/7');
    const provider7 = await testAPI('/api/providers/7');
    console.log(`   Status: ${provider7.status}`);
    console.log(`   Response:`, JSON.stringify(provider7.data, null, 2));
    
    // Test 2: Get all providers
    console.log('\n📡 Test 2: GET /api/providers');
    const allProviders = await testAPI('/api/providers');
    console.log(`   Status: ${allProviders.status}`);
    console.log(`   Providers count: ${allProviders.data.providers?.length || 0}`);
    if (allProviders.data.providers) {
      allProviders.data.providers.forEach(p => {
        console.log(`     - ID ${p.id}: ${p.business_name}`);
      });
    }
    
    // Test 3: Get services
    console.log('\n📡 Test 3: GET /api/services');
    const services = await testAPI('/api/services');
    console.log(`   Status: ${services.status}`);
    console.log(`   Services count: ${services.data.services?.length || 0}`);
    if (services.data.services) {
      services.data.services.forEach(s => {
        console.log(`     - Service ${s.id}: ${s.title} (provider_id: ${s.provider_id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
