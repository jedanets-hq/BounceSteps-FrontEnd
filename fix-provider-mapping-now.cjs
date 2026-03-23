const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/fix-services-provider-mapping',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔧 Fixing services.provider_id mapping...\n');

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
        
        if (json.fixed && json.fixed.length > 0) {
          console.log('\n📋 Fixed services:');
          json.fixed.forEach(f => {
            console.log(`   - Service ${f.service_id}: "${f.title}"`);
            console.log(`     Provider ID: ${f.old_provider_id} → ${f.new_provider_id}`);
            if (f.created_provider) {
              console.log(`     ✨ Created new service_provider record`);
            }
          });
        }
        
        if (json.errors && json.errors.length > 0) {
          console.log('\n❌ Errors:');
          json.errors.forEach(e => {
            console.log(`   - Service ${e.service_id}: ${e.error}`);
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
