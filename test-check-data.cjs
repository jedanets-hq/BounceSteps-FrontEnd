const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/check-data',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Testing /api/fix/check-data endpoint...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const json = JSON.parse(data);
      
      if (json.success) {
        console.log('\n📦 Services:');
        if (json.services && json.services.length > 0) {
          json.services.forEach(s => {
            console.log(`   - Service ${s.id}: ${s.title} (provider_id: ${s.provider_id})`);
          });
        } else {
          console.log('   No services found');
        }
        
        console.log('\n👤 Users:');
        if (json.users && json.users.length > 0) {
          json.users.forEach(u => {
            console.log(`   - User ${u.id}: ${u.email} (${u.first_name} ${u.last_name})`);
          });
        } else {
          console.log('   No users found');
        }
        
        console.log('\n👥 Service Providers:');
        if (json.providers && json.providers.length > 0) {
          json.providers.forEach(p => {
            console.log(`   - Provider ${p.id}: ${p.business_name} (user_id: ${p.user_id})`);
          });
        } else {
          console.log('   No service providers found');
        }
        
        console.log('\n🔍 Analysis:');
        if (json.services && json.services.length > 0) {
          json.services.forEach(s => {
            const user = json.users.find(u => u.id === s.provider_id);
            const provider = json.providers.find(p => p.user_id === s.provider_id);
            
            console.log(`\nService "${s.title}" (provider_id: ${s.provider_id}):`);
            console.log(`   User exists: ${user ? 'YES ✅' : 'NO ❌'}`);
            console.log(`   Provider record exists: ${provider ? 'YES ✅' : 'NO ❌'}`);
            
            if (user && !provider) {
              console.log(`   ⚠️  ACTION NEEDED: Create service_provider for user ${user.id}`);
            } else if (!user) {
              console.log(`   ⚠️  ACTION NEEDED: User ${s.provider_id} does not exist!`);
            }
          });
        }
      } else {
        console.log('❌ Error:', json.message);
      }
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
