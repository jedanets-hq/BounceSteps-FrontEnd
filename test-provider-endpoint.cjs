const http = require('http');

const providerId = 1; // service_providers.id from our data

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/providers/${providerId}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log(`🔍 Testing GET /api/providers/${providerId}...\n`);

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
        console.log('\n✅ Provider found!');
        console.log('\n📋 Provider Details:');
        console.log(`   ID: ${json.provider.id}`);
        console.log(`   Business Name: ${json.provider.business_name}`);
        console.log(`   User ID: ${json.provider.user_id}`);
        console.log(`   Email: ${json.provider.email}`);
        console.log(`   Services Count: ${json.provider.services_count}`);
        
        if (json.provider.services && json.provider.services.length > 0) {
          console.log('\n📦 Services:');
          json.provider.services.forEach(s => {
            console.log(`   - ${s.title} (${s.category})`);
          });
        }
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

req.end();
