const https = require('https');

const BACKEND_URL = 'https://isafarinetworkglobal-2.onrender.com';

console.log('🔍 Testing Backend Connection...\n');

// Test 1: Health Check
function testHealth() {
  return new Promise((resolve) => {
    https.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Health Check:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        console.log('   Response:', data.substring(0, 100));
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ Health Check: FAIL');
      console.log('   Error:', err.message);
      resolve();
    });
  });
}

// Test 2: Get Services
function testServices() {
  return new Promise((resolve) => {
    https.get(`${BACKEND_URL}/api/services`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✅ Services Endpoint:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        try {
          const services = JSON.parse(data);
          console.log('   Total Services:', services.length || 0);
          if (services.length > 0) {
            console.log('   Sample Service:', services[0].title);
            console.log('   Location:', services[0].location);
          }
        } catch (e) {
          console.log('   Response:', data.substring(0, 100));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('\n❌ Services Endpoint: FAIL');
      console.log('   Error:', err.message);
      resolve();
    });
  });
}

// Test 3: Get Providers
function testProviders() {
  return new Promise((resolve) => {
    https.get(`${BACKEND_URL}/api/providers`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✅ Providers Endpoint:', res.statusCode === 200 ? 'PASS' : 'FAIL');
        try {
          const providers = JSON.parse(data);
          console.log('   Total Providers:', providers.length || 0);
        } catch (e) {
          console.log('   Response:', data.substring(0, 100));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('\n❌ Providers Endpoint: FAIL');
      console.log('   Error:', err.message);
      resolve();
    });
  });
}

async function runTests() {
  await testHealth();
  await testServices();
  await testProviders();
  console.log('\n✅ Tests Complete!\n');
}

runTests();
