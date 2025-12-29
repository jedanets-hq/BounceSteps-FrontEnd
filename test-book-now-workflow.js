#!/usr/bin/env node

/**
 * Complete "Book Now" Workflow Test
 * Tests the entire flow from login to cart
 */

const http = require('http');
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  "Book Now" Workflow End-to-End Test                      ║');
console.log('║  Testing complete flow: Login → Services → Cart           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let testToken = null;
let testUserId = null;
let testServiceId = null;

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

// Test steps
async function step1_CheckBackend() {
  console.log('📍 Step 1: Check Backend Health\n');
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
    console.log('   💡 Start backend with: npm run dev:backend\n');
    return false;
  }
}

async function step2_Login() {
  console.log('📍 Step 2: Login as Traveler\n');
  try {
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
          console.log(`   📝 User ID: ${testUserId}`);
          console.log(`   🔐 Token: ${testToken.substring(0, 20)}...\n`);
          return true;
        }
      } catch (e) {
        console.log('   ❌ Invalid response format\n');
        return false;
      }
    } else if (response.status === 401) {
      console.log('   ⚠️  Invalid credentials');
      console.log('   💡 Create test user first\n');
      return false;
    } else {
      console.log(`   ❌ Login failed with status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Login error: ${error.message}\n`);
    return false;
  }
}

async function step3_GetServices() {
  console.log('📍 Step 3: Get Available Services\n');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/services`);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        let services = [];
        
        if (Array.isArray(data)) {
          services = data;
        } else if (data.services && Array.isArray(data.services)) {
          services = data.services;
        }

        if (services.length > 0) {
          testServiceId = services[0].id;
          console.log('   ✅ Services retrieved');
          console.log(`   📊 Total services: ${services.length}`);
          console.log(`   🎯 First service: ${services[0].title || services[0].name}`);
          console.log(`   💰 Price: ${services[0].price}`);
          console.log(`   🏢 Provider: ${services[0].business_name || services[0].provider_id}\n`);
          return true;
        } else {
          console.log('   ⚠️  No services found\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid response format\n');
        return false;
      }
    } else {
      console.log(`   ❌ Get services failed with status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Get services error: ${error.message}\n`);
    return false;
  }
}

async function step4_ClickBookNow() {
  console.log('📍 Step 4: Click "Book Now" (Add to Cart)\n');
  
  if (!testToken || !testServiceId) {
    console.log('   ❌ Missing token or service ID\n');
    return false;
  }

  try {
    const cartData = {
      serviceId: testServiceId,
      quantity: 1
    };

    console.log(`   📤 Sending request to /api/cart/add`);
    console.log(`   📝 Service ID: ${testServiceId}`);
    console.log(`   📝 Quantity: 1\n`);

    const response = await makeRequest(
      `${BACKEND_URL}/api/cart/add`,
      'POST',
      { Authorization: `Bearer ${testToken}` },
      JSON.stringify(cartData)
    );

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success) {
          console.log('   ✅ Item added to cart successfully');
          console.log(`   📝 Cart Item ID: ${data.cartItem?.id}`);
          console.log(`   📝 Quantity: ${data.cartItem?.quantity}\n`);
          return true;
        } else {
          console.log(`   ❌ Add to cart failed: ${data.message}\n`);
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid response format\n');
        return false;
      }
    } else if (response.status === 401) {
      console.log('   ❌ Authentication failed (401)');
      console.log('   💡 Token may be invalid or expired\n');
      return false;
    } else if (response.status === 404) {
      console.log('   ❌ Cart endpoint not found (404)');
      console.log('   💡 This is the "Book Now" error!');
      console.log('   💡 Cart routes may not be registered in backend\n');
      return false;
    } else {
      console.log(`   ❌ Add to cart failed with status ${response.status}`);
      console.log(`   📝 Response: ${response.body.substring(0, 100)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Add to cart error: ${error.message}\n`);
    return false;
  }
}

async function step5_ViewCart() {
  console.log('📍 Step 5: View Cart\n');
  
  if (!testToken) {
    console.log('   ❌ Missing token\n');
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
          console.log(`   📊 Items in cart: ${data.cartItems.length}`);
          
          if (data.cartItems.length > 0) {
            data.cartItems.forEach((item, index) => {
              console.log(`   📦 Item ${index + 1}: ${item.title || item.service_id}`);
              console.log(`      Quantity: ${item.quantity}`);
              console.log(`      Price: ${item.price}`);
            });
          }
          console.log();
          return true;
        } else {
          console.log('   ⚠️  Unexpected response format\n');
          return false;
        }
      } catch (e) {
        console.log('   ❌ Invalid response format\n');
        return false;
      }
    } else {
      console.log(`   ❌ View cart failed with status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ View cart error: ${error.message}\n`);
    return false;
  }
}

// Run all steps
async function runWorkflow() {
  const results = [];
  
  results.push(await step1_CheckBackend());
  if (!results[0]) {
    console.log('❌ Cannot proceed - backend not running\n');
    process.exit(1);
  }

  results.push(await step2_Login());
  if (!results[1]) {
    console.log('⚠️  Cannot proceed - login failed\n');
    process.exit(1);
  }

  results.push(await step3_GetServices());
  if (!results[2]) {
    console.log('⚠️  Cannot proceed - no services available\n');
    process.exit(1);
  }

  results.push(await step4_ClickBookNow());
  results.push(await step5_ViewCart());

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Workflow Summary                                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Steps completed: ${passed}/${total}\n`);

  if (passed === total) {
    console.log('✅ "Book Now" workflow is working correctly!\n');
    console.log('🎉 The error "API endpoint not found" has been fixed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some steps failed. See details above.\n');
    process.exit(1);
  }
}

runWorkflow().catch(error => {
  console.error('❌ Workflow test failed:', error);
  process.exit(1);
});
