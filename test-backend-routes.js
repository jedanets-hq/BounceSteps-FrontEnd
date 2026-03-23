// Test if backend routes are accessible
const https = require('https');

const testEndpoint = (path, method = 'OPTIONS') => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'isafarimasterorg.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`\n${method} ${path}`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data) {
          console.log('Response:', data);
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.error(`Error testing ${path}:`, error.message);
      reject(error);
    });

    req.end();
  });
};

async function testAllRoutes() {
  console.log('🧪 Testing Backend Routes on Production...\n');
  console.log('Backend URL: https://isafarimasterorg.onrender.com');
  console.log('='.repeat(60));

  const routes = [
    '/health',
    '/api/cart',
    '/api/cart/add',
    '/api/bookings',
    '/api/favorites',
    '/api/plans',
    '/api/providers',
    '/api/users/profile',
    '/api/services'
  ];

  for (const route of routes) {
    try {
      await testEndpoint(route, 'OPTIONS');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait between requests
    } catch (error) {
      console.error(`Failed to test ${route}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Route testing complete');
}

testAllRoutes().catch(console.error);
