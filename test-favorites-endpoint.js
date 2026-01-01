/**
 * Test Favorites API Endpoint
 * Run: node test-favorites-endpoint.js
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function testFavoritesEndpoint() {
  console.log('🧪 Testing Favorites API Endpoint\n');
  console.log('Backend URL:', API_URL);
  console.log('─'.repeat(50));

  // Test 1: Check if favorites test endpoint exists
  console.log('\n1️⃣ Testing /api/favorites/test (no auth required)...');
  try {
    const testRes = await fetch(`${API_URL}/favorites/test`);
    const testData = await testRes.json();
    console.log('   Status:', testRes.status);
    console.log('   Response:', JSON.stringify(testData, null, 2));
    
    if (testRes.status === 200 && testData.success) {
      console.log('   ✅ Favorites route is mounted correctly!');
    } else if (testRes.status === 404) {
      console.log('   ❌ 404 - Favorites route NOT found. Backend needs redeployment.');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 2: Check favorites endpoint without auth (should return 401)
  console.log('\n2️⃣ Testing /api/favorites (no auth - should return 401)...');
  try {
    const noAuthRes = await fetch(`${API_URL}/favorites`);
    const noAuthData = await noAuthRes.json();
    console.log('   Status:', noAuthRes.status);
    console.log('   Response:', JSON.stringify(noAuthData, null, 2));
    
    if (noAuthRes.status === 401) {
      console.log('   ✅ Correct! Returns 401 when not authenticated.');
    } else if (noAuthRes.status === 404) {
      console.log('   ❌ 404 - Route not found. This is the problem!');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 3: Check health endpoint
  console.log('\n3️⃣ Testing /api/health...');
  try {
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status);
    console.log('   Response:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n' + '─'.repeat(50));
  console.log('📋 Summary:');
  console.log('   - If /favorites/test returns 404: Backend needs redeployment');
  console.log('   - If /favorites returns 401: Routes are working correctly');
  console.log('   - If /favorites returns 404: Check server.js route mounting');
}

testFavoritesEndpoint();
