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

async function testProviders() {
  console.log('🔍 Testing specific providers...\n');

  try {
    // Test provider 2
    console.log('1️⃣ Testing Provider 2 (Updated Business Name)');
    const provider2 = await testAPI('/api/providers/2');
    console.log(`   Status: ${provider2.success ? '✅' : '❌'}`);
    if (provider2.success) {
      console.log(`   Business: ${provider2.provider.business_name}`);
      console.log(`   Services: ${provider2.provider.services?.length || 0}`);
      if (provider2.provider.services && provider2.provider.services.length > 0) {
        provider2.provider.services.forEach(s => {
          console.log(`     - ${s.title} (${s.category})`);
        });
      }
    } else {
      console.log(`   Error: ${provider2.message}`);
    }
    console.log('');

    // Test provider 5
    console.log('2️⃣ Testing Provider 5 (shop2)');
    const provider5 = await testAPI('/api/providers/5');
    console.log(`   Status: ${provider5.success ? '✅' : '❌'}`);
    if (provider5.success) {
      console.log(`   Business: ${provider5.provider.business_name}`);
      console.log(`   Services: ${provider5.provider.services?.length || 0}`);
      if (provider5.provider.services && provider5.provider.services.length > 0) {
        provider5.provider.services.forEach(s => {
          console.log(`     - ${s.title} (${s.category})`);
        });
      }
    } else {
      console.log(`   Error: ${provider5.message}`);
    }
    console.log('');

    // Test all services
    console.log('3️⃣ Testing /api/services (all services)');
    const allServices = await testAPI('/api/services');
    console.log(`   Status: ${allServices.success ? '✅' : '❌'}`);
    console.log(`   Total services: ${allServices.services?.length || 0}`);
    
    // Count services per provider
    const servicesByProvider = {};
    if (allServices.services) {
      allServices.services.forEach(s => {
        const providerId = s.service_provider_id || s.provider_id;
        if (!servicesByProvider[providerId]) {
          servicesByProvider[providerId] = [];
        }
        servicesByProvider[providerId].push(s.title);
      });
      
      console.log('\n   Services per provider:');
      Object.keys(servicesByProvider).sort().forEach(pid => {
        console.log(`     Provider ${pid}: ${servicesByProvider[pid].length} services`);
        servicesByProvider[pid].forEach(title => {
          console.log(`       - ${title}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️ Make sure backend server is running on port 5000');
  }
}

testProviders();
