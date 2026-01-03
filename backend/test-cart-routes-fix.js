/**
 * Test Cart Routes Fix
 * Tests the cart API endpoints to verify 404 errors are resolved
 */

const API_BASE_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

// Test credentials (use existing test user)
const TEST_USER = {
  email: 'test@example.com',
  password: '123456'
};

async function testCartRoutesFix() {
  console.log('🧪 Testing Cart Routes Fix\n');
  console.log('Backend:', API_BASE_URL);
  console.log('═══════════════════════════════════════════════════\n');

  let token = null;

  // Test 1: Health check
  console.log('1️⃣  Testing health endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('   ✅ Health check:', data.status);
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Cart test endpoint (no auth)
  console.log('\n2️⃣  Testing cart test endpoint (no auth required)...');
  try {
    const response = await fetch(`${API_BASE_URL}/cart/test`);
    const data = await response.json();
    if (data.success) {
      console.log('   ✅ Cart routes are loaded and accessible');
      console.log('   Message:', data.message);
    } else {
      console.log('   ❌ Cart test endpoint failed:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Cart test endpoint error:', error.message);
  }

  // Test 3: Login to get token
  console.log('\n3️⃣  Logging in to get auth token...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    const data = await response.json();
    
    if (data.success && data.token) {
      token = data.token;
      console.log('   ✅ Login successful');
      console.log('   User:', data.user.email, '(', data.user.userType, ')');
    } else {
      console.log('   ❌ Login failed:', data.message);
      console.log('   Note: You may need to create a test user first');
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }

  // Test 4: GET /api/cart (should return 200 or 401, NOT 404)
  console.log('\n4️⃣  Testing GET /api/cart...');
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    
    if (response.status === 404) {
      console.log('   ❌ STILL GETTING 404 - Routes not loading correctly');
    } else if (response.status === 401) {
      console.log('   ⚠️  401 Unauthorized - JWT auth issue');
      console.log('   Message:', data.message);
    } else if (response.status === 200 && data.success) {
      console.log('   ✅ Cart endpoint working!');
      console.log('   Items:', data.cartItems?.length || 0);
    } else {
      console.log('   ⚠️  Unexpected response:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 5: POST /api/cart/add (should return 200 or 401, NOT 404)
  console.log('\n5️⃣  Testing POST /api/cart/add...');
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceId: 1,
        quantity: 1
      })
    });
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    
    if (response.status === 404) {
      console.log('   ❌ STILL GETTING 404 - Routes not loading correctly');
    } else if (response.status === 401) {
      console.log('   ⚠️  401 Unauthorized - JWT auth issue');
      console.log('   Message:', data.message);
    } else if (response.status === 200 && data.success) {
      console.log('   ✅ Add to cart endpoint working!');
      console.log('   Message:', data.message);
    } else if (response.status === 400) {
      console.log('   ⚠️  400 Bad Request:', data.message);
    } else if (response.status === 404 && data.message === 'Service not found') {
      console.log('   ✅ Endpoint working (service not found is expected)');
    } else {
      console.log('   ⚠️  Unexpected response:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 Test Summary:');
  console.log('   - If you see 404 errors: Routes not loading');
  console.log('   - If you see 401 errors: JWT authentication issue');
  console.log('   - If you see 200 responses: Fix is working! ✅');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run tests
testCartRoutesFix().catch(console.error);
