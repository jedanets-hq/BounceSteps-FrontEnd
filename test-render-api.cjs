const https = require('https');

async function testRenderAPI() {
  console.log('🔍 TESTING RENDER BACKEND API\n');
  console.log('='.repeat(80));
  
  // Test 1: Get all providers
  console.log('\n📋 Test 1: GET /api/providers');
  await new Promise((resolve) => {
    https.get('https://isafarimasterorg.onrender.com/api/providers', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Providers found: ${json.providers?.length || 0}`);
          if (json.providers && json.providers.length > 0) {
            console.log('   Sample providers:');
            json.providers.slice(0, 3).forEach((p, i) => {
              console.log(`     ${i + 1}. ${p.business_name} (${p.email})`);
            });
          } else {
            console.log('   ⚠️  NO PROVIDERS RETURNED!');
          }
        } catch (e) {
          console.log('   ❌ Error parsing response:', e.message);
          console.log('   Response:', data.substring(0, 200));
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log('   ❌ Request failed:', e.message);
      resolve();
    });
  });
  
  // Test 2: Get all services
  console.log('\n📋 Test 2: GET /api/services');
  await new Promise((resolve) => {
    https.get('https://isafarimasterorg.onrender.com/api/services', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Services found: ${json.services?.length || 0}`);
          if (json.services && json.services.length > 0) {
            console.log('   Sample services:');
            json.services.slice(0, 3).forEach((s, i) => {
              console.log(`     ${i + 1}. "${s.title}" by ${s.business_name || 'UNKNOWN'}`);
            });
          } else {
            console.log('   ⚠️  NO SERVICES RETURNED!');
          }
        } catch (e) {
          console.log('   ❌ Error parsing response:', e.message);
          console.log('   Response:', data.substring(0, 200));
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log('   ❌ Request failed:', e.message);
      resolve();
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 DIAGNOSIS:');
  console.log('   If providers/services are 0, backend needs to be redeployed');
  console.log('   Database has data, but backend code may have old JOIN logic');
  console.log('='.repeat(80));
}

testRenderAPI();
