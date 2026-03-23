const http = require('http');

const postData = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fix/check-foreign-keys',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('🔍 Checking foreign key constraints...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.success) {
        console.log('📋 Foreign Key Constraints:\n');
        json.constraints.forEach(c => {
          console.log(`Table: ${c.table_name}`);
          console.log(`  Column: ${c.column_name}`);
          console.log(`  References: ${c.foreign_table_name}.${c.foreign_column_name}`);
          console.log(`  Constraint: ${c.constraint_name}\n`);
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

req.write(postData);
req.end();
