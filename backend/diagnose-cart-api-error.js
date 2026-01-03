const axios = require('axios');

const BACKEND_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function diagnoseCartAPI() {
  console.log('🔍 Diagnosing Cart API Error\n');
  console.log('Backend URL:', BACKEND_URL);
  console.log('═'.repeat(60));

  // Test 1: Health check
  console.log('\n1️⃣  Testing backend health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    console.log('   ✅ Backend is responding');
    console.log('   Status:', response.data.status);
    console.log('   Message:', response.data.message);
  } catch (error) {
    console.log('   ❌ Backend health check failed');
    console.log('   Error:', error.message);
    return;
  }

  // Test 2: Try to access cart endpoint without auth
  console.log('\n2️⃣  Testing cart endpoint (no auth)...');
  try {
    const response = await axios.get(`${BACKEND_URL}/cart`);
    console.log('   Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('   ✅ Cart endpoint exists (requires authentication)');
      } else if (error.response.status === 404) {
        console.log('   ❌ Cart endpoint NOT FOUND - routes not registered!');
      }
    } else {
      console.log('   ❌ Network error:', error.message);
    }
  }

  // Test 3: Try cart/add endpoint
  console.log('\n3️⃣  Testing cart/add endpoint (no auth)...');
  try {
    const response = await axios.post(`${BACKEND_URL}/cart/add`, {
      serviceId: 1,
      quantity: 1
    });
    console.log('   Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('   ✅ Cart/add endpoint exists (requires authentication)');
      } else if (error.response.status === 404) {
        console.log('   ❌ Cart/add endpoint NOT FOUND - routes not registered!');
      }
    } else {
      console.log('   ❌ Network error:', error.message);
    }
  }

  // Test 4: Check if it's a CORS issue
  console.log('\n4️⃣  Checking CORS headers...');
  try {
    const response = await axios.options(`${BACKEND_URL}/cart`);
    console.log('   CORS headers:', response.headers);
  } catch (error) {
    console.log('   Could not check CORS:', error.message);
  }

  console.log('\n═'.repeat(60));
  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('   If cart endpoints return 404: Backend needs redeployment');
  console.log('   If cart endpoints return 401: Routes are working, auth needed');
  console.log('   If network errors: Backend might be down or URL wrong');
  console.log('\n💡 SOLUTION:');
  console.log('   1. Verify backend/routes/cart.js exists');
  console.log('   2. Verify backend/server.js has: app.use(\'/api/cart\', cartRoutes)');
  console.log('   3. Redeploy backend to Render');
  console.log('   4. Clear browser cache and test again');
}

diagnoseCartAPI().catch(console.error);
