const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/fix-orphaned-services',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔧 Fixing orphaned services...\n');

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
            console.log(`     Provider: ${f.old_provider_id} → ${f.new_provider_id}`);
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
