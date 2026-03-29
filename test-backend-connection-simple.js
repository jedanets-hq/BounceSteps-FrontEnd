/**
 * Simple Backend Connection Test
 */

const http = require('http');

console.log('🔍 Testing backend connection...\n');

// Test 1: Health check
const healthOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const healthReq = http.request(healthOptions, (res) => {
  console.log('✅ Backend is responding!');
  console.log(`   Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`   Response: ${data}\n`);
    
    // Test 2: API endpoint
    testApiEndpoint();
  });
});

healthReq.on('error', (error) => {
  console.error('❌ Backend connection failed!');
  console.error(`   Error: ${error.message}`);
  console.error('\n💡 Solutions:');
  console.error('   1. Start backend: cd backend && npm start');
  console.error('   2. Check if port 5000 is in use');
  console.error('   3. Check firewall settings');
});

healthReq.on('timeout', () => {
  console.error('❌ Backend connection timeout!');
  healthReq.destroy();
});

healthReq.end();

function testApiEndpoint() {
  const apiOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/providers/1',
    method: 'GET',
    timeout: 5000
  };

  const apiReq = http.request(apiOptions, (res) => {
    console.log('✅ API endpoint is responding!');
    console.log(`   Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`   Success: ${json.success}`);
        console.log(`   Data received: ${json.data ? 'Yes' : 'No'}\n`);
        
        console.log('🎉 Backend is working correctly!');
        console.log('\n💡 If frontend still fails:');
        console.log('   1. Restart your frontend dev server');
        console.log('   2. Clear browser cache (Ctrl+Shift+Delete)');
        console.log('   3. Check browser console for CORS errors');
      } catch (e) {
        console.log(`   Response: ${data.substring(0, 100)}...\n`);
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('❌ API endpoint failed!');
    console.error(`   Error: ${error.message}`);
  });

  apiReq.on('timeout', () => {
    console.error('❌ API endpoint timeout!');
    apiReq.destroy();
  });

  apiReq.end();
}
