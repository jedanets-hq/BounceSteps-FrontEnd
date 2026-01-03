// Test cart endpoint directly
const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function testCartEndpoint() {
  console.log('🧪 Testing Cart Endpoint\n');
  console.log('Backend URL:', API_URL);
  console.log('Testing endpoint: GET /api/cart\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  // Test 2: Cart test endpoint (no auth)
  console.log('\n2️⃣ Testing cart test endpoint (no auth)...');
  try {
    const testResponse = await fetch(`${API_URL}/cart/test`);
    const testData = await testResponse.json();
    console.log('✅ Cart test endpoint:', testData);
  } catch (error) {
    console.error('❌ Cart test endpoint failed:', error.message);
  }

  // Test 3: Cart GET without auth (should return 401)
  console.log('\n3️⃣ Testing cart GET without auth (should return 401)...');
  try {
    const cartResponse = await fetch(`${API_URL}/cart`);
    const cartData = await cartResponse.json();
    console.log(`Status: ${cartResponse.status}`);
    console.log('Response:', cartData);
    
    if (cartResponse.status === 401) {
      console.log('✅ Correctly returns 401 for unauthenticated request');
    } else if (cartResponse.status === 404) {
      console.log('❌ ERROR: Returns 404 - route not found!');
    }
  } catch (error) {
    console.error('❌ Cart GET failed:', error.message);
  }

  // Test 4: Try with a test token
  console.log('\n4️⃣ Testing cart GET with invalid token (should return 401)...');
  try {
    const cartResponse = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': 'Bearer invalid_token_for_testing'
      }
    });
    const cartData = await cartResponse.json();
    console.log(`Status: ${cartResponse.status}`);
    console.log('Response:', cartData);
    
    if (cartResponse.status === 401) {
      console.log('✅ Correctly returns 401 for invalid token');
    } else if (cartResponse.status === 404) {
      console.log('❌ ERROR: Returns 404 - route not found!');
    }
  } catch (error) {
    console.error('❌ Cart GET with token failed:', error.message);
  }
}

testCartEndpoint().catch(console.error);
