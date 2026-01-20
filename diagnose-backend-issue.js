// Comprehensive backend diagnostics
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
        'Origin': 'https://isafari-tz.netlify.app',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout
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
          resolve({ 
            status: res.statusCode, 
            data: parsed, 
            headers: res.headers,
            raw: responseData
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData, 
            headers: res.headers,
            raw: responseData,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function comprehensiveDiagnostics() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 COMPREHENSIVE BACKEND DIAGNOSTICS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Backend URL:', BACKEND_URL);
  console.log('Frontend URL: https://isafari-tz.netlify.app');
  console.log('═══════════════════════════════════════════════════════════\n');

  const tests = [];

  // Test 1: Root endpoint
  console.log('📍 Test 1: Root Endpoint (/)');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/');
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    console.log('Headers:', result.headers);
    tests.push({ name: 'Root Endpoint', status: result.status === 200 ? 'PASS' : 'FAIL', code: result.status });
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'Root Endpoint', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Test 2: Health endpoint
  console.log('📍 Test 2: Health Endpoint (/health)');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/health');
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    tests.push({ name: 'Health Endpoint', status: result.status === 200 ? 'PASS' : 'FAIL', code: result.status });
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'Health Endpoint', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Test 3: API Health endpoint
  console.log('📍 Test 3: API Health Endpoint (/api/health)');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/api/health');
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    tests.push({ name: 'API Health', status: result.status === 200 ? 'PASS' : 'FAIL', code: result.status });
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'API Health', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Test 4: Registration endpoint with minimal data
  console.log('📍 Test 4: Registration Endpoint - Minimal Data');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/api/auth/register', 'POST', {
      email: `test_minimal_${Date.now()}@example.com`,
      password: 'Test123456!',
      firstName: 'Test',
      lastName: 'User',
      userType: 'traveler'
    });
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201 || result.status === 200) {
      console.log('✅ Registration WORKING!');
      tests.push({ name: 'Registration (minimal)', status: 'PASS', code: result.status });
    } else if (result.status === 400) {
      console.log('⚠️ Validation error (expected):', result.data.message);
      tests.push({ name: 'Registration (minimal)', status: 'VALIDATION_ERROR', code: result.status, message: result.data.message });
    } else if (result.status === 500) {
      console.log('❌ Server error:', result.data.message);
      tests.push({ name: 'Registration (minimal)', status: 'SERVER_ERROR', code: result.status, message: result.data.message });
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'Registration (minimal)', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Test 5: Registration endpoint with full data
  console.log('📍 Test 5: Registration Endpoint - Full Data');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/api/auth/register', 'POST', {
      email: `test_full_${Date.now()}@example.com`,
      password: 'Test123456!',
      firstName: 'Test',
      lastName: 'User',
      phone: '0793123456',
      userType: 'traveler',
      dateOfBirth: '1990-01-01',
      nationality: 'Tanzania'
    });
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 201 || result.status === 200) {
      console.log('✅ Registration WORKING!');
      tests.push({ name: 'Registration (full)', status: 'PASS', code: result.status });
    } else {
      console.log('⚠️ Error:', result.data.message);
      tests.push({ name: 'Registration (full)', status: 'FAIL', code: result.status, message: result.data.message });
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'Registration (full)', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Test 6: Login endpoint
  console.log('📍 Test 6: Login Endpoint');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 401) {
      console.log('✅ Login endpoint responding correctly (401 for wrong credentials)');
      tests.push({ name: 'Login Endpoint', status: 'PASS', code: result.status });
    } else {
      tests.push({ name: 'Login Endpoint', status: 'UNEXPECTED', code: result.status });
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'Login Endpoint', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Test 7: CORS Preflight
  console.log('📍 Test 7: CORS Preflight (OPTIONS)');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const result = await makeRequest('/api/auth/register', 'OPTIONS');
    console.log('Status:', result.status);
    console.log('CORS Headers:');
    console.log('  - Access-Control-Allow-Origin:', result.headers['access-control-allow-origin']);
    console.log('  - Access-Control-Allow-Methods:', result.headers['access-control-allow-methods']);
    console.log('  - Access-Control-Allow-Headers:', result.headers['access-control-allow-headers']);
    console.log('  - Access-Control-Allow-Credentials:', result.headers['access-control-allow-credentials']);
    
    if (result.headers['access-control-allow-origin']) {
      console.log('✅ CORS configured');
      tests.push({ name: 'CORS', status: 'PASS', code: result.status });
    } else {
      console.log('⚠️ CORS headers missing');
      tests.push({ name: 'CORS', status: 'FAIL', code: result.status });
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    tests.push({ name: 'CORS', status: 'ERROR', error: error.message });
  }
  console.log('\n');

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR' || t.status === 'SERVER_ERROR').length;
  const total = tests.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('\nDetailed Results:');
  console.log('─────────────────────────────────────────────────────────');
  
  tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : 
                 test.status === 'ERROR' || test.status === 'SERVER_ERROR' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${icon} ${test.name}: ${test.status} ${test.code ? `(${test.code})` : ''}`);
    if (test.message) {
      console.log(`   Message: ${test.message}`);
    }
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔧 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════════');
  
  const serverErrors = tests.filter(t => t.status === 'SERVER_ERROR');
  const notFound = tests.filter(t => t.code === 404);
  
  if (serverErrors.length > 0) {
    console.log('\n❌ SERVER ERRORS DETECTED:');
    console.log('   1. Check Render logs for detailed error messages');
    console.log('   2. Verify DATABASE_URL environment variable is set');
    console.log('   3. Verify JWT_SECRET environment variable is set');
    console.log('   4. Check if database tables exist');
    console.log('   5. Verify database connection is working');
    console.log('\n   Run on Render Dashboard:');
    console.log('   - Go to https://dashboard.render.com');
    console.log('   - Select "isafarimasterorg" service');
    console.log('   - Click "Logs" tab');
    console.log('   - Look for error messages');
  }
  
  if (notFound.length > 0) {
    console.log('\n⚠️ 404 ERRORS DETECTED:');
    console.log('   Backend structure might be different.');
    console.log('   Check if routes are properly configured in server.js');
  }
  
  if (passed === total) {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('   Backend is working correctly.');
    console.log('   Registration should work from frontend.');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
}

comprehensiveDiagnostics().catch(console.error);
