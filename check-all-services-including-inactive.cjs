const http = require('http');

const postData = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/check-data',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Checking ALL services (including inactive)...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.success) {
        console.log('📦 ALL SERVICES IN DATABASE:');
        console.log('─'.repeat(80));
        console.log(`Total: ${json.services.length} services\n`);
        
        json.services.forEach(s => {
          console.log(`ID: ${s.id} | Title: ${s.title} | Provider ID: ${s.provider_id}`);
        });
        
        console.log('\n👤 USERS:');
        console.log('─'.repeat(80));
        json.users.forEach(u => {
          console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.first_name} ${u.last_name}`);
        });
        
        console.log('\n👥 SERVICE PROVIDERS:');
        console.log('─'.repeat(80));
        json.providers.forEach(p => {
          console.log(`ID: ${p.id} | User ID: ${p.user_id} | Business: ${p.business_name}`);
        });
      } else {
        console.log('❌ Error:', json.message);
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
