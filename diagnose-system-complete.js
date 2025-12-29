#!/usr/bin/env node

/**
 * Complete System Diagnosis Script
 * Checks all critical components of the iSafari Global system
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4028';

console.log('\n=== iSafari Global System Diagnosis ===\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}\n`);

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  console.log('1. Testing Backend Health...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    if (response.status === 200) {
      console.log('   ✓ Backend is running');
      return true;
    } else {
      console.log(`   ✗ Backend returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot connect to backend: ${error.message}`);
    return false;
  }
}

async function testCartEndpoint() {
  console.log('\n2. Testing Cart Endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/cart/add`, 'POST', {
      'Authorization': 'Bearer test-token'
    });
    
    if (response.status === 401 || response.status === 400 || response.status === 200) {
      console.log(`   ✓ Cart endpoint exists (status: ${response.status})`);
      return true;
    } else if (response.status === 404) {
      console.log('   ✗ Cart endpoint NOT FOUND (404)');
      return false;
    } else {
      console.log(`   ? Cart endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot reach cart endpoint: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoint() {
  console.log('\n3. Testing Auth Endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, 'POST');
    
    if (response.status === 400 || response.status === 200 || response.status === 401) {
      console.log(`   ✓ Auth endpoint exists (status: ${response.status})`);
      return true;
    } else if (response.status === 404) {
      console.log('   ✗ Auth endpoint NOT FOUND (404)');
      return false;
    } else {
      console.log(`   ? Auth endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot reach auth endpoint: ${error.message}`);
    return false;
  }
}

async function testServicesEndpoint() {
  console.log('\n4. Testing Services Endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/services`);
    
    if (response.status === 200) {
      console.log(`   ✓ Services endpoint exists (status: ${response.status})`);
      try {
        const data = JSON.parse(response.body);
        console.log(`   ✓ Services data is valid JSON`);
        if (Array.isArray(data) || (data && data.services)) {
          console.log(`   ✓ Services data structure is correct`);
          return true;
        }
      } catch (e) {
        console.log(`   ✗ Services data is not valid JSON`);
        return false;
      }
    } else if (response.status === 404) {
      console.log('   ✗ Services endpoint NOT FOUND (404)');
      return false;
    } else {
      console.log(`   ? Services endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot reach services endpoint: ${error.message}`);
    return false;
  }
}

async function testCORSHeaders() {
  console.log('\n5. Testing CORS Headers...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`, 'OPTIONS', {
      'Origin': FRONTEND_URL,
      'Access-Control-Request-Method': 'POST'
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log(`   ✓ CORS enabled: ${corsHeader}`);
      return true;
    } else {
      console.log('   ✗ CORS headers not found');
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot test CORS: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n6. Testing Database Connection...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    const body = JSON.parse(response.body);
    
    if (body.database === 'connected' || body.db === 'connected') {
      console.log('   ✓ Database is connected');
      return true;
    } else if (response.status === 200) {
      console.log('   ? Backend is running but database status unclear');
      return false;
    } else {
      console.log('   ✗ Database connection failed');
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot check database: ${error.message}`);
    return false;
  }
}

async function checkBackendRoutes() {
  console.log('\n7. Checking Backend Routes...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/routes`);
    
    if (response.status === 200) {
      try {
        const routes = JSON.parse(response.body);
        console.log('   ✓ Routes endpoint exists');
        
        const hasCart = JSON.stringify(routes).includes('cart');
        const hasAuth = JSON.stringify(routes).includes('auth');
        const hasServices = JSON.stringify(routes).includes('services');
        
        if (hasCart) console.log('   ✓ Cart routes registered');
        else console.log('   ✗ Cart routes NOT registered');
        
        if (hasAuth) console.log('   ✓ Auth routes registered');
        else console.log('   ✗ Auth routes NOT registered');
        
        if (hasServices) console.log('   ✓ Services routes registered');
        else console.log('   ✗ Services routes NOT registered');
        
        return hasCart && hasAuth && hasServices;
      } catch (e) {
        console.log('   ✗ Routes data is not valid JSON');
        return false;
      }
    } else {
      console.log(`   ? Routes endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ Cannot check routes: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runDiagnosis() {
  const results = [];
  
  results.push(await testBackendHealth());
  results.push(await testCartEndpoint());
  results.push(await testAuthEndpoint());
  results.push(await testServicesEndpoint());
  results.push(await testCORSHeaders());
  results.push(await testDatabaseConnection());
  results.push(await checkBackendRoutes());
  
  console.log('\n=== Diagnosis Summary ===\n');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Tests passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✓ All systems operational!');
  } else {
    console.log('\n✗ Some systems need attention. See details above.');
  }
  
  console.log('\n=== Recommendations ===\n');
  
  if (!results[0]) {
    console.log('• Backend is not running. Start it with: npm run dev:backend');
  }
  
  if (!results[1]) {
    console.log('• Cart endpoint is missing. Check backend/routes/cart.js is registered in server.js');
  }
  
  if (!results[4]) {
    console.log('• CORS is not configured. Add CORS middleware to backend/server.js');
  }
  
  if (!results[5]) {
    console.log('• Database connection failed. Check DATABASE_URL in .env');
  }
  
  process.exit(passed === total ? 0 : 1);
}

runDiagnosis().catch(error => {
  console.error('Diagnosis failed:', error);
  process.exit(1);
});
