const http = require('http');

// Create a simple endpoint to check schema
const postData = JSON.stringify({
  query: `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'service_providers'
    ORDER BY ordinal_position
  `
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/check-schema',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('🔍 Checking service_providers schema via API...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.success) {
        console.log('📋 Columns in service_providers table:');
        console.log('─'.repeat(80));
        json.columns.forEach(col => {
          console.log(`${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        console.log('─'.repeat(80));
        console.log(`\nTotal columns: ${json.columns.length}`);
      } else {
        console.log('❌ Error:', json.message);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();
