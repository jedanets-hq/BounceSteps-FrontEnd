const http = require('http');

console.log('🔍 TESTING IF BACKEND IS RUNNING\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/services',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is RUNNING!`);
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`\n📊 Response:`, json);
      if (json.services) {
        console.log(`\n✅ Found ${json.services.length} services`);
      }
    } catch (e) {
      console.log('\n📄 Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Backend is NOT RUNNING!`);
  console.error(`   Error: ${e.message}`);
  console.error(`\n💡 Solution: Start backend with: cd backend && npm start`);
});

req.on('timeout', () => {
  console.error(`❌ Backend TIMEOUT!`);
  req.destroy();
});

req.end();
