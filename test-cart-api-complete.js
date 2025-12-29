#!/usr/bin/env node

/**
 * Complete Cart API Testing Script
 * Tests all cart endpoints with proper authentication
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Cart API Testing Suite                                    ║');
console.log('║  Testing all cart endpoints with authentication            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let testToken = null;
let testUserId = null;
let testServiceId = null;
let testCartItemId = null;

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', headers = {}, body = null) {
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

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  console.log('1️⃣  Testing Backend Health...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    if (response.status === 200) {
      console.log('   ✅ Backend is running\n');
      return true;
    } else {
      console.log(`   ❌ Backend returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot connect to backend: ${error.message}`);
    console.log('   💡 Make sure backend is running: npm run dev:backend\n');
    return false;
  }
}

async function testUserLogin() {
  console.log('2️⃣  Testing User Login...');
  try {
    // Try to login with test credentials
    const loginData = {
      email: 'traveler@test.com',
      password: 'password123'
    };

    const response = await makeRequest(
      `${BACKEND_URL}/api/auth/login`,
      'POST',
      {},
      JSON.stringify(loginData)
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success && data.token) {
          testToken = data.token;
          testUserId = data.user?.id;
          console.log('   ✅ Login successful');
          console.log(`   📝 Token: ${testToken.substring(0, 20)}...`);
          console.log(`   👤 User ID: ${testUserId}\n`);
          return true;
        } else {
          console.log('   ⚠️  Login returned 200 but no token\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid JSON response from login\n');
        return false;
      }
    } else if (response.status === 401) {
      console.log('   ⚠️  Invalid credentials - test user may not exist');
      console.log('   💡 Create test user first\n');
      return false;
    } else {
      console.log(`   ❌ Login returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Login failed: ${error.message}\n`);
    return false;
  }
}

async function testGetServices() {
  console.log('3️⃣  Testing Get Services...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/services`);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (Array.isArray(data) && data.length > 0) {
          testServiceId = data[0].id;
          console.log('   ✅ Services retrieved');
          console.log(`   📝 Found ${data.length} services`);
          console.log(`   🎯 Using service ID: ${testServiceId}\n`);
          return true;
        } else if (data.services && Array.isArray(data.services) && data.services.length > 0) {
          testServiceId = data.services[0].id;
          console.log('   ✅ Services retrieved');
          console.log(`   📝 Found ${data.services.length} services`);
          console.log(`   🎯 Using service ID: ${testServiceId}\n`);
          return true;
        } else {
          console.log('   ⚠️  No services found in database\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid JSON response from services\n');
        return false;
      }
    } else {
      console.log(`   ❌ Services returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Get services failed: ${error.message}\n`);
    return false;
  }
}

async function testAddToCart() {
  console.log('4️⃣  Testing Add to Cart (POST /api/cart/add)...');
  
  if (!testToken) {
    console.log('   ❌ No authentication token - skipping\n');
    return false;
  }

  if (!testServiceId) {
    console.log('   ❌ No service ID - skipping\n');
    return false;
  }

  try {
    const cartData = {
      serviceId: testServiceId,
      quantity: 1
    };

    const response = await makeRequest(
      `${BACKEND_URL}/api/cart/add`,
      'POST',
      { Authorization: `Bearer ${testToken}` },
      JSON.stringify(cartData)
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success && data.cartItem) {
          testCartItemId = data.cartItem.id;
          console.log('   ✅ Item added to cart');
          console.log(`   📝 Cart Item ID: ${testCartItemId}`);
          console.log(`   📝 Service ID: ${data.cartItem.service_id}`);
          console.log(`   📝 Quantity: ${data.cartItem.quantity}\n`);
          return true;
        } else {
          console.log('   ⚠️  Response success but missing cartItem\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid JSON response from add to cart\n');
        return false;
      }
    } else if (response.status === 401) {
      console.log('   ❌ Authentication failed (401)');
      console.log('   💡 Token may be invalid or expired\n');
      return false;
    } else if (response.status === 404) {
      console.log('   ❌ Cart endpoint not found (404)');
      console.log('   💡 Cart routes may not be registered in backend\n');
      return false;
    } else {
      console.log(`   ❌ Add to cart returned status ${response.status}`);
      console.log(`   📝 Response: ${response.body.substring(0, 100)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Add to cart failed: ${error.message}\n`);
    return false;
  }
}

async function testGetCart() {
  console.log('5️⃣  Testing Get Cart (GET /api/cart)...');
  
  if (!testToken) {
    console.log('   ❌ No authentication token - skipping\n');
    return false;
  }

  try {
    const response = await makeRequest(
      `${BACKEND_URL}/api/cart`,
      'GET',
      { Authorization: `Bearer ${testToken}` }
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success && Array.isArray(data.cartItems)) {
          console.log('   ✅ Cart retrieved');
          console.log(`   📝 Items in cart: ${data.cartItems.length}`);
          if (data.cartItems.length > 0) {
            console.log(`   📝 First item: ${data.cartItems[0].title || data.cartItems[0].service_id}`);
          }
          console.log();
          return true;
        } else {
          console.log('   ⚠️  Response success but missing cartItems\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid JSON response from get cart\n');
        return false;
      }
    } else if (response.status === 401) {
      console.log('   ❌ Authentication failed (401)\n');
      return false;
    } else {
      console.log(`   ❌ Get cart returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Get cart failed: ${error.message}\n`);
    return false;
  }
}

async function testUpdateCart() {
  console.log('6️⃣  Testing Update Cart (PUT /api/cart/:id)...');
  
  if (!testToken || !testCartItemId) {
    console.log('   ❌ Missing token or cart item ID - skipping\n');
    return false;
  }

  try {
    const updateData = { quantity: 2 };

    const response = await makeRequest(
      `${BACKEND_URL}/api/cart/${testCartItemId}`,
      'PUT',
      { Authorization: `Bearer ${testToken}` },
      JSON.stringify(updateData)
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success) {
          console.log('   ✅ Cart item updated');
          console.log(`   📝 New quantity: ${data.cartItem?.quantity || 2}\n`);
          return true;
        } else {
          console.log('   ⚠️  Response success but missing cartItem\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid JSON response from update cart\n');
        return false;
      }
    } else {
      console.log(`   ❌ Update cart returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Update cart failed: ${error.message}\n`);
    return false;
  }
}

async function testDeleteCart() {
  console.log('7️⃣  Testing Delete Cart Item (DELETE /api/cart/:id)...');
  
  if (!testToken || !testCartItemId) {
    console.log('   ❌ Missing token or cart item ID - skipping\n');
    return false;
  }

  try {
    const response = await makeRequest(
      `${BACKEND_URL}/api/cart/${testCartItemId}`,
      'DELETE',
      { Authorization: `Bearer ${testToken}` }
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success) {
          console.log('   ✅ Cart item deleted\n');
          return true;
        } else {
          console.log('   ⚠️  Response success but unexpected format\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid JSON response from delete cart\n');
        return false;
      }
    } else {
      console.log(`   ❌ Delete cart returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Delete cart failed: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [];
  
  results.push(await testBackendHealth());
  if (!results[0]) {
    console.log('❌ Backend not running - cannot continue tests\n');
    process.exit(1);
  }

  results.push(await testUserLogin());
  if (!results[1]) {
    console.log('⚠️  User login failed - some tests will be skipped\n');
  }

  results.push(await testGetServices());
  results.push(await testAddToCart());
  results.push(await testGetCart());
  results.push(await testUpdateCart());
  results.push(await testDeleteCart());

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Tests passed: ${passed}/${total}\n`);

  if (passed === total) {
    console.log('✅ All tests passed! Cart API is working correctly.\n');
  } else {
    console.log('❌ Some tests failed. Check the output above for details.\n');
  }

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
