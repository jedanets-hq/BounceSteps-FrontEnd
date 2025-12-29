const http = require('http');

console.log('\n🧪 Testing Backend Direct Connection\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/services',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Connected! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`✅ Got response: ${json.services ? json.services.length + ' services' : 'error'}`);
    } catch (e) {
      console.log('Response:', data.substring(0, 100));
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Request timeout');
  req.destroy();
  process.exit(1);
});

req.end();
