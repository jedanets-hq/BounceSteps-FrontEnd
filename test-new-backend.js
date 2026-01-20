// Test new backend connection
const https = require('https');

const BACKEND_URL = 'https://isafarimasterorg.onrender.com';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://isafari-tz.netlify.app'
      }
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testBackend() {
  console.log('🧪 Testing New Backend: https://isafarimasterorg.onrender.com\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing /health endpoint...');
  try {
    const result = await makeRequest('/health');
    console.log('   Status:', result.status);
    console.log('   Response:', result.data);
    if (result.status === 200) {
      console.log('   ✅ Health check PASSED\n');
    } else {
      console.log('   ⚠️ Health check returned non-200 status\n');
    }
  } catch (error) {
    console.log('   ❌ Health check FAILED:', error.message, '\n');
  }
  
  // Test 2: Root endpoint
  console.log('2️⃣ Testing / (root) endpoint...');
  try {
    const result = await makeRequest('/');
    console.log('   Status:', result.status);
    console.log('   Response:', result.data);
    if (result.status === 200) {
      console.log('   ✅ Root endpoint PASSED\n');
    } else {
      console.log('   ⚠️ Root endpoint returned non-200 status\n');
    }
  } catch (error) {
    console.log('   ❌ Root endpoint FAILED:', error.message, '\n');
  }
  
  // Test 3: Registration endpoint
  console.log('3️⃣ Testing /api/auth/register endpoint...');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const result = await makeRequest('/api/auth/register', 'POST', {
      email: testEmail,
      password: 'Test123456!',
      firstName: 'Test',
      lastName: 'User',
      phone: '0793123456',
      userType: 'traveler'
    });
    console.log('   Status:', result.status);
    console.log('   Response:', result.data);
    
    if (result.status === 201 || result.status === 200) {
      console.log('   ✅ Registration endpoint WORKING!\n');
    } else if (result.status === 400 && result.data.message) {
      console.log('   ⚠️ Registration returned error (expected for validation):', result.data.message, '\n');
    } else {
      console.log('   ⚠️ Unexpected response\n');
    }
  } catch (error) {
    console.log('   ❌ Registration test FAILED:', error.message, '\n');
  }
  
  // Test 4: CORS headers
  console.log('4️⃣ Testing CORS configuration...');
  try {
    const result = await makeRequest('/api/auth/register', 'OPTIONS');
    console.log('   Status:', result.status);
    console.log('   CORS Headers:');
    console.log('     - Access-Control-Allow-Origin:', result.headers['access-control-allow-origin']);
    console.log('     - Access-Control-Allow-Methods:', result.headers['access-control-allow-methods']);
    console.log('     - Access-Control-Allow-Headers:', result.headers['access-control-allow-headers']);
    
    if (result.headers['access-control-allow-origin']) {
      console.log('   ✅ CORS configured correctly\n');
    } else {
      console.log('   ⚠️ CORS headers missing\n');
    }
  } catch (error) {
    console.log('   ❌ CORS test FAILED:', error.message, '\n');
  }
  
  console.log('═══════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════');
  console.log('Backend URL: https://isafarimasterorg.onrender.com');
  console.log('Frontend URL: https://isafari-tz.netlify.app');
  console.log('═══════════════════════════════════════\n');
}

testBackend().catch(console.error);
