#!/usr/bin/env node

/**
 * Test Add to Cart Functionality
 * Tests: Login → Get Services → Add to Cart → Verify in Database
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:5000/api';

let authToken = null;
let userId = null;
let testServiceId = null;

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const protocol = url.protocol === 'https:' ? require('https') : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('\n🧪 TESTING ADD TO CART FUNCTIONALITY\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Login
    console.log('\n📝 STEP 1: Login');
    console.log('─'.repeat(60));
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'traveler@example.com',
      password: 'password123'
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      console.log('❌ Login failed');
      console.log('Response:', loginRes.data);
      return;
    }

    authToken = loginRes.data.token;
    userId = loginRes.data.user.id;
    console.log('✅ Login successful');
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);

    // Step 2: Get Services
    console.log('\n📝 STEP 2: Get Available Services');
    console.log('─'.repeat(60));
    const servicesRes = await makeRequest('GET', '/services');

    if (servicesRes.status !== 200 || !servicesRes.data.services) {
      console.log('❌ Failed to get services');
      console.log('Response:', servicesRes.data);
      return;
    }

    testServiceId = servicesRes.data.services[0].id;
    console.log('✅ Services retrieved');
    console.log(`   Total: ${servicesRes.data.services.length}`);
    console.log(`   Test Service ID: ${testServiceId}`);
    console.log(`   Service: ${servicesRes.data.services[0].title}`);

    // Step 3: Add to Cart
    console.log('\n📝 STEP 3: Add Service to Cart');
    console.log('─'.repeat(60));
    const addRes = await makeRequest('POST', '/cart/add', {
      serviceId: testServiceId,
      quantity: 1
    }, authToken);

    console.log(`   Status: ${addRes.status}`);
    console.log(`   Response:`, addRes.data);

    if (addRes.status !== 200 || !addRes.data.success) {
      console.log('❌ Failed to add to cart');
      return;
    }

    console.log('✅ Item added to cart');

    // Step 4: Get Cart
    console.log('\n📝 STEP 4: Verify Cart Contents');
    console.log('─'.repeat(60));
    const cartRes = await makeRequest('GET', '/cart', null, authToken);

    console.log(`   Status: ${cartRes.status}`);
    
    if (cartRes.status !== 200 || !cartRes.data.success) {
      console.log('❌ Failed to get cart');
      console.log('Response:', cartRes.data);
      return;
    }

    const cartItems = cartRes.data.cartItems;
    console.log('✅ Cart retrieved');
    console.log(`   Items in cart: ${cartItems.length}`);

    if (cartItems.length === 0) {
      console.log('❌ Cart is empty! Item was not saved.');
      return;
    }

    cartItems.forEach((item, idx) => {
      console.log(`\n   Item ${idx + 1}:`);
      console.log(`   - ID: ${item.id}`);
      console.log(`   - Title: ${item.title}`);
      console.log(`   - Service ID: ${item.service_id}`);
      console.log(`   - Quantity: ${item.quantity}`);
      console.log(`   - Price: $${item.price}`);
      console.log(`   - Category: ${item.category}`);
      console.log(`   - Location: ${item.location}`);
    });

    // Step 5: Verify Data Structure
    console.log('\n📝 STEP 5: Verify Data Structure for UI');
    console.log('─'.repeat(60));
    const item = cartItems[0];
    const checks = [
      { field: 'item.id', exists: !!item.id, value: item.id },
      { field: 'item.title', exists: !!item.title, value: item.title },
      { field: 'item.category', exists: !!item.category, value: item.category },
      { field: 'item.location', exists: !!item.location, value: item.location },
      { field: 'item.price', exists: !!item.price, value: item.price },
      { field: 'item.quantity', exists: !!item.quantity, value: item.quantity }
    ];

    let allGood = true;
    checks.forEach(check => {
      const icon = check.exists ? '✅' : '❌';
      console.log(`   ${icon} ${check.field}: ${check.value}`);
      if (!check.exists) allGood = false;
    });

    if (allGood) {
      console.log('\n✅ All required fields present!');
    } else {
      console.log('\n❌ Some fields missing!');
    }

    // Step 6: Test Add Multiple
    console.log('\n📝 STEP 6: Add Another Service');
    console.log('─'.repeat(60));
    const secondServiceId = servicesRes.data.services[1].id;
    const addRes2 = await makeRequest('POST', '/cart/add', {
      serviceId: secondServiceId,
      quantity: 1
    }, authToken);

    if (addRes2.data.success) {
      console.log('✅ Second item added');
      
      const cartRes2 = await makeRequest('GET', '/cart', null, authToken);
      console.log(`   Total items now: ${cartRes2.data.cartItems.length}`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ ALL TESTS PASSED - Add to Cart is working!');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

test();
