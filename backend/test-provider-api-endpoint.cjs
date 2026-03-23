const http = require('http');

async function testProviderEndpoint(providerId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/providers/${providerId}`,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, error: 'Failed to parse JSON' });
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
  console.log('🧪 TESTING PROVIDER API ENDPOINTS\n');
  console.log('='.repeat(80));
  console.log('NOTE: Make sure backend server is running on port 5000\n');

  const testIds = [1, 2, 3, 4, 5, 6, 7];

  for (const id of testIds) {
    console.log(`\n📋 Testing /api/providers/${id}`);
    console.log('-'.repeat(40));

    try {
      const result = await testProviderEndpoint(id);
      console.log(`   Status: ${result.status}`);

      if (result.data.success) {
        const provider = result.data.provider;
        console.log(`   ✅ Provider found: ${provider.business_name}`);
        console.log(`      service_providers.id: ${provider.id}`);
        console.log(`      user_id: ${provider.user_id}`);
        console.log(`      services_count: ${provider.services_count || provider.services?.length || 0}`);
        
        if (provider.services && provider.services.length > 0) {
          console.log(`      Services:`);
          provider.services.forEach(s => {
            console.log(`         - ${s.title}`);
          });
        } else {
          console.log(`      ⚠️ No services for this provider`);
        }
      } else {
        console.log(`   ❌ ${result.data.message || 'Provider not found'}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('   ⚠️ Backend server is not running!');
        break;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST COMPLETE\n');
}

runTests();
