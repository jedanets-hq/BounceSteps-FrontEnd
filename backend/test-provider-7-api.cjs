const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testProvider7() {
  console.log('🔍 Testing Provider ID 7 API...\n');

  try {
    // Test provider 7
    console.log('Testing /api/providers/7');
    const result = await testAPI('/api/providers/7');
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    console.log('');

    // Test provider 2 (Dan's actual provider)
    console.log('Testing /api/providers/2 (Dan\'s actual provider)');
    const result2 = await testAPI('/api/providers/2');
    console.log(`Status: ${result2.status}`);
    console.log('Response:', JSON.stringify(result2.data, null, 2));
    console.log('');

    // Test provider 5 (Dan's other provider)
    console.log('Testing /api/providers/5 (Dan\'s other provider)');
    const result5 = await testAPI('/api/providers/5');
    console.log(`Status: ${result5.status}`);
    console.log('Response:', JSON.stringify(result5.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProvider7();
