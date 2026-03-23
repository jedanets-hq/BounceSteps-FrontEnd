const http = require('http');

function testAPI(path) {
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
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
  console.log('🔍 Testing API endpoints...\n');

  try {
    // Test providers endpoint
    console.log('1️⃣ Testing /api/providers');
    const providersData = await testAPI('/api/providers');
    console.log(`   Status: ${providersData.success ? '✅' : '❌'}`);
    console.log(`   Providers found: ${providersData.providers?.length || 0}`);
    if (providersData.providers && providersData.providers.length > 0) {
      providersData.providers.forEach(p => {
        console.log(`     - ID: ${p.id}, Business: ${p.business_name}`);
      });
    }
    console.log('');

    // Test services endpoint
    console.log('2️⃣ Testing /api/services');
    const servicesData = await testAPI('/api/services');
    console.log(`   Status: ${servicesData.success ? '✅' : '❌'}`);
    console.log(`   Services found: ${servicesData.services?.length || 0}`);
    if (servicesData.services && servicesData.services.length > 0) {
      servicesData.services.forEach(s => {
        console.log(`     - ID: ${s.id}, Title: ${s.title}, Provider: ${s.service_provider_id || s.provider_id}`);
      });
    }
    console.log('');

    // Test featured services endpoint
    console.log('3️⃣ Testing /api/services/featured/slides');
    const featuredData = await testAPI('/api/services/featured/slides');
    console.log(`   Status: ${featuredData.success ? '✅' : '❌'}`);
    console.log(`   Featured services found: ${featuredData.services?.length || 0}`);
    if (featuredData.services && featuredData.services.length > 0) {
      featuredData.services.forEach(s => {
        console.log(`     - ID: ${s.id}, Title: ${s.title}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️ Make sure backend server is running on port 5000');
  }
}

runTests();
