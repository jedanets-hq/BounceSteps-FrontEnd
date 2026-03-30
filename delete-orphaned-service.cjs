const http = require('http');

const postData = JSON.stringify({
  serviceId: 3  // TEST1 service
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/delete-orphaned-service',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('🗑️  Deleting orphaned service...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    
    try {
      const json = JSON.parse(data);
      
      if (json.success) {
        console.log('\n✅', json.message);
      } else {
        console.log('\n❌ Error:', json.message);
      }
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();
