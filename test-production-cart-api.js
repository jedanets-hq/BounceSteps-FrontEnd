// Test Production Cart API
const fetch = require('node-fetch');

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function testCartAPI() {
  console.log('🧪 Testing Production Cart API\n');
  console.log('Backend URL:', API_URL);
  console.log('═'.repeat(60));

  // Test 1: Check if backend is responding
  console.log('\n📡 Test 1: Backend Health Check');
  try {
    const response = await fetch(`${API_URL}/health`);
    console.log('   Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend is responding');
      console.log('   Response:', data);
    } else {
      console.log('   ⚠️  Backend returned error:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Backend not responding:', error.message);
  }

  // Test 2: Check cart endpoint without auth (should return 401)
  console.log('\n📡 Test 2: Cart Endpoint (No Auth)');
  try {
    const response = await fetch(`${API_URL}/cart`);
    console.log('   Status:', response.status);
    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));
    
    if (response.status === 401) {
      console.log('   ✅ Cart endpoint exists (requires auth)');
    } else if (response.status === 404) {
      console.log('   ❌ Cart endpoint NOT FOUND - Route not registered!');
    } else {
      console.log('   ⚠️  Unexpected status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 3: Check cart/add endpoint without auth
  console.log('\n📡 Test 3: Cart Add Endpoint (No Auth)');
  try {
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: 1, quantity: 1 })
    });
    console.log('   Status:', response.status);
    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));
    
    if (response.status === 401) {
      console.log('   ✅ Cart add endpoint exists (requires auth)');
    } else if (response.status === 404) {
      console.log('   ❌ Cart add endpoint NOT FOUND - Route not registered!');
    } else {
      console.log('   ⚠️  Unexpected status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 4: List all available routes
  console.log('\n📡 Test 4: Check Available Routes');
  try {
    const response = await fetch(`${API_URL}/`);
    console.log('   Status:', response.status);
    const text = await response.text();
    console.log('   Response preview:', text.substring(0, 300));
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n═'.repeat(60));
  console.log('\n💡 DIAGNOSIS:');
  console.log('   If cart endpoints return 404, the routes are not deployed');
  console.log('   If cart endpoints return 401, the routes exist but need auth');
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Check if backend/routes/cart.js is in the repository');
  console.log('   2. Check if backend/server.js registers cart routes');
  console.log('   3. Redeploy backend to Render');
  console.log('   4. Check Render logs for any startup errors');
}

testCartAPI().catch(console.error);
