// Diagnostic script to test cart API endpoints in production
const https = require('https');

const API_BASE = 'https://isafarinetworkglobal-2.onrender.com';

// Test user credentials (you'll need to provide a valid token)
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token from localStorage

console.log('🔍 Diagnosing Cart API Routes in Production\n');
console.log('Backend:', API_BASE);
console.log('='

.repeat(60));

// Test 1: Health check
async function testHealth() {
  return new Promise((resolve) => {
    https.get(`${API_BASE}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✅ Test 1: Health Check');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve();
      });
    }).on('error', (err) => {
      console.log('\n❌ Test 1: Health Check FAILED');
      console.log('Error:', err.message);
      resolve();
    });
  });
}

// Test 2: GET /api/cart (without auth)
async function testCartNoAuth() {
  return new Promise((resolve) => {
    https.get(`${API_BASE}/api/cart`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n📦 Test 2: GET /api/cart (No Auth)');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve();
      });
    }).on('error', (err) => {
      console.log('\n❌ Test 2: GET /api/cart FAILED');
      console.log('Error:', err.message);
      resolve();
    });
  });
}

// Test 3: GET /api/cart (with auth)
async function testCartWithAuth() {
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('\n⚠️  Test 3: Skipped (No token provided)');
    console.log('   To test with auth, replace TEST_TOKEN in this script');
    return;
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'isafarinetworkglobal-2.onrender.com',
      path: '/api/cart',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n🔐 Test 3: GET /api/cart (With Auth)');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log('\n❌ Test 3: GET /api/cart (With Auth) FAILED');
      console.log('Error:', err.message);
      resolve();
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  await testHealth();
  await testCartNoAuth();
  await testCartWithAuth();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('1. If health check works but cart returns 404:');
  console.log('   → Routes not properly mounted or cart.js has errors');
  console.log('\n2. If cart returns 401 Unauthorized:');
  console.log('   → Authentication middleware is working, need valid token');
  console.log('\n3. If cart returns 404 "API endpoint not found":');
  console.log('   → Request hitting the catch-all 404 handler');
  console.log('   → Check if cartRoutes is properly exported/imported');
  console.log('\n');
}

runTests();
