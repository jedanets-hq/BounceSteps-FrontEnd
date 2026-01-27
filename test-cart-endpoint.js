/**
 * Test Cart Endpoint Availability
 * This script tests if the cart API endpoint is accessible
 */

const API_URL = 'https://isafarimasterorg.onrender.com/api';

async function testEndpoint(endpoint, method = 'GET', token = null, body = null) {
  console.log(`\n🔍 Testing ${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    console.log(`   Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return { success: true, status: response.status, data };
    } else {
      const text = await response.text();
      console.log(`   Response (text):`, text.substring(0, 200));
      return { success: false, status: response.status, error: 'Non-JSON response' };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Cart API Endpoints');
  console.log('   Backend:', API_URL);
  console.log('');
  
  // Test 1: Health check (without /api prefix)
  console.log('═══════════════════════════════════════');
  console.log('Test 1: Health Check');
  console.log('═══════════════════════════════════════');
  const healthUrl = API_URL.replace('/api', '');
  const healthResponse = await fetch(`${healthUrl}/health`);
  console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
  const healthData = await healthResponse.json();
  console.log(`   Response:`, JSON.stringify(healthData, null, 2));
  
  // Test 2: Get cart without auth (should fail with 401)
  console.log('\n═══════════════════════════════════════');
  console.log('Test 2: Get Cart (No Auth - Should Fail)');
  console.log('═══════════════════════════════════════');
  await testEndpoint('/cart', 'GET');
  
  // Test 3: Add to cart without auth (should fail with 401)
  console.log('\n═══════════════════════════════════════');
  console.log('Test 3: Add to Cart (No Auth - Should Fail)');
  console.log('═══════════════════════════════════════');
  await testEndpoint('/cart', 'POST', null, { serviceId: 1, quantity: 1 });
  
  // Test 4: Login to get token
  console.log('\n═══════════════════════════════════════');
  console.log('Test 4: Login (Get Token)');
  console.log('═══════════════════════════════════════');
  console.log('⚠️  You need to provide test user credentials');
  console.log('   Update this script with valid email/password');
  
  // Uncomment and update with valid credentials:
  /*
  const loginResult = await testEndpoint('/auth/login', 'POST', null, {
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  if (loginResult.success && loginResult.data.token) {
    const token = loginResult.data.token;
    console.log('   ✅ Login successful, token obtained');
    
    // Test 5: Get cart with auth
    console.log('\n═══════════════════════════════════════');
    console.log('Test 5: Get Cart (With Auth)');
    console.log('═══════════════════════════════════════');
    await testEndpoint('/cart', 'GET', token);
    
    // Test 6: Add to cart with auth
    console.log('\n═══════════════════════════════════════');
    console.log('Test 6: Add to Cart (With Auth)');
    console.log('═══════════════════════════════════════');
    await testEndpoint('/cart/add', 'POST', token, { serviceId: 1, quantity: 1 });
    
    // Test 7: Get cart again to verify
    console.log('\n═══════════════════════════════════════');
    console.log('Test 7: Get Cart Again (Verify Add)');
    console.log('═══════════════════════════════════════');
    await testEndpoint('/cart', 'GET', token);
  }
  */
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Tests Complete');
  console.log('═══════════════════════════════════════');
  console.log('\nNext Steps:');
  console.log('1. If health check fails: Backend is not running');
  console.log('2. If cart endpoints return 404: Routes not registered');
  console.log('3. If cart endpoints return 401: Authentication required (expected)');
  console.log('4. Update script with valid credentials to test authenticated endpoints');
}

// Run tests
runTests().catch(console.error);
