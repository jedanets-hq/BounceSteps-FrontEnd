const http = require('http');

console.log('\n🧪 Testing Login Endpoint\n');

const loginData = JSON.stringify({
  email: 'traveler@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Timeout');
  req.destroy();
  process.exit(1);
});

req.write(loginData);
req.end();
