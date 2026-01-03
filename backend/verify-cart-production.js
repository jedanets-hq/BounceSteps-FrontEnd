/**
 * Production Cart API Verification Script
 * Tests cart endpoints to verify they're properly deployed
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

console.log('═'.repeat(70));
console.log('🧪 PRODUCTION CART API VERIFICATION');
console.log('═'.repeat(70));
console.log(`\n📍 Backend URL: ${API_URL}\n`);

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n📡 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Method: ${options.method || 'GET'}`);
    
    const response = await fetch(url, options);
    const status = response.status;
    
    console.log(`   Status: ${status}`);
    
    // Try to get response body
    const contentType = response.headers.get('content-type');
    let body = '';
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      body = JSON.stringify(data, null, 2);
    } else {
      body = await response.text();
    }
    
    console.log(`   Response: ${body.substring(0, 150)}${body.length > 150 ? '...' : ''}`);
    
    return { status, body };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { status: 0, error: error.message };
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health check
  console.log('\n' + '─'.repeat(70));
  console.log('TEST 1: Backend Health Check');
  console.log('─'.repeat(70));
  const health = await testEndpoint(
    'Health Check',
    `${API_URL}/health`
  );
  if (health.status === 200) {
    console.log('   ✅ PASS: Backend is responding');
    passed++;
  } else {
    console.log('   ❌ FAIL: Backend not responding correctly');
    failed++;
  }
  
  // Test 2: GET /cart without auth (should return 401, not 404)
  console.log('\n' + '─'.repeat(70));
  console.log('TEST 2: GET /api/cart (No Auth)');
  console.log('─'.repeat(70));
  const getCart = await testEndpoint(
    'Get Cart (No Auth)',
    `${API_URL}/cart`
  );
  if (getCart.status === 401) {
    console.log('   ✅ PASS: Endpoint exists (returns 401 Unauthorized)');
    passed++;
  } else if (getCart.status === 404) {
    console.log('   ❌ FAIL: Endpoint NOT FOUND (returns 404)');
    console.log('   💡 This means cart routes are not deployed!');
    failed++;
  } else {
    console.log(`   ⚠️  UNEXPECTED: Status ${getCart.status}`);
    failed++;
  }
  
  // Test 3: POST /cart/add without auth (should return 401, not 404)
  console.log('\n' + '─'.repeat(70));
  console.log('TEST 3: POST /api/cart/add (No Auth)');
  console.log('─'.repeat(70));
  const addCart = await testEndpoint(
    'Add to Cart (No Auth)',
    `${API_URL}/cart/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: 1, quantity: 1 })
    }
  );
  if (addCart.status === 401) {
    console.log('   ✅ PASS: Endpoint exists (returns 401 Unauthorized)');
    passed++;
  } else if (addCart.status === 404) {
    console.log('   ❌ FAIL: Endpoint NOT FOUND (returns 404)');
    console.log('   💡 This means cart routes are not deployed!');
    failed++;
  } else {
    console.log(`   ⚠️  UNEXPECTED: Status ${addCart.status}`);
    failed++;
  }
  
  // Test 4: PUT /cart/:id without auth (should return 401, not 404)
  console.log('\n' + '─'.repeat(70));
  console.log('TEST 4: PUT /api/cart/1 (No Auth)');
  console.log('─'.repeat(70));
  const updateCart = await testEndpoint(
    'Update Cart Item (No Auth)',
    `${API_URL}/cart/1`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 2 })
    }
  );
  if (updateCart.status === 401) {
    console.log('   ✅ PASS: Endpoint exists (returns 401 Unauthorized)');
    passed++;
  } else if (updateCart.status === 404) {
    console.log('   ❌ FAIL: Endpoint NOT FOUND (returns 404)');
    failed++;
  } else {
    console.log(`   ⚠️  UNEXPECTED: Status ${updateCart.status}`);
    failed++;
  }
  
  // Test 5: DELETE /cart/:id without auth (should return 401, not 404)
  console.log('\n' + '─'.repeat(70));
  console.log('TEST 5: DELETE /api/cart/1 (No Auth)');
  console.log('─'.repeat(70));
  const deleteCart = await testEndpoint(
    'Delete Cart Item (No Auth)',
    `${API_URL}/cart/1`,
    {
      method: 'DELETE'
    }
  );
  if (deleteCart.status === 401) {
    console.log('   ✅ PASS: Endpoint exists (returns 401 Unauthorized)');
    passed++;
  } else if (deleteCart.status === 404) {
    console.log('   ❌ FAIL: Endpoint NOT FOUND (returns 404)');
    failed++;
  } else {
    console.log(`   ⚠️  UNEXPECTED: Status ${deleteCart.status}`);
    failed++;
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70));
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 SUCCESS: All cart endpoints are properly deployed!');
    console.log('   Cart functionality should work in production.');
  } else {
    console.log('\n⚠️  ISSUES DETECTED:');
    if (getCart.status === 404 || addCart.status === 404) {
      console.log('   • Cart routes are returning 404 (Not Found)');
      console.log('   • This means the routes are not deployed to production');
      console.log('\n💡 SOLUTION:');
      console.log('   1. Verify backend/routes/cart.js exists in repository');
      console.log('   2. Verify backend/server.js registers cart routes');
      console.log('   3. Commit and push changes to trigger Render deployment');
      console.log('   4. Wait for deployment to complete');
      console.log('   5. Run this script again to verify');
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
