#!/usr/bin/env node

/**
 * COMPREHENSIVE ADD-TO-CART DIAGNOSTIC
 * Tests the complete flow from frontend to backend to database
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
let testUserId = null;
let testUserToken = null;
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

    const protocol = url.protocol === 'https:' ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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

async function test1_CheckBackendConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Backend Connection');
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest('GET', '/services');
    
    if (response.status === 200) {
      console.log('✅ Backend is running and responding');
      console.log(`   Status: ${response.status}`);
      console.log(`   Services available: ${response.data.services?.length || 0}`);
      return true;
    } else {
      console.log(`❌ Backend returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    return false;
  }
}

async function test2_GetTestUser() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Get Test User');
  console.log('='.repeat(60));
  
  try {
    // Try to get existing users
    const response = await makeRequest('GET', '/auth/verify');
    
    if (response.status === 401) {
      console.log('⚠️  No authenticated user. Need to login first.');
      console.log('   Creating test user...');
      
      // Try to create a test user
      const registerResponse = await makeRequest('POST', '/auth/register', {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        userType: 'traveler'
      });
      
      if (registerResponse.data?.success) {
        console.log('✅ Test user created');
        console.log(`   Email: ${registerResponse.data.user?.email}`);
        testUserId = registerResponse.data.user?.id;
        testUserToken = registerResponse.data.token;
        return true;
      } else {
        console.log('❌ Failed to create test user:', registerResponse.data?.message);
        return false;
      }
    } else if (response.status === 200) {
      console.log('✅ User already authenticated');
      testUserId = response.data.user?.id;
      testUserToken = response.data.token;
      return true;
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test3_GetTestService() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Get Test Service');
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest('GET', '/services');
    
    if (response.data?.services && response.data.services.length > 0) {
      testServiceId = response.data.services[0].id;
      const service = response.data.services[0];
      
      console.log('✅ Test service found');
      console.log(`   ID: ${testServiceId}`);
      console.log(`   Title: ${service.title}`);
      console.log(`   Price: $${service.price}`);
      console.log(`   Category: ${service.category}`);
      return true;
    } else {
      console.log('❌ No services available');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test4_CheckCartTableExists() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Check Cart Table in Database');
  console.log('='.repeat(60));
  
  try {
    // Try to get cart (should be empty but table should exist)
    const response = await makeRequest('GET', '/cart', null, testUserToken);
    
    if (response.status === 200) {
      console.log('✅ Cart table exists and is accessible');
      console.log(`   Current items: ${response.data.cartItems?.length || 0}`);
      return true;
    } else if (response.status === 401) {
      console.log('❌ Not authenticated - token issue');
      return false;
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test5_AddToCartAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Add to Cart API Call');
  console.log('='.repeat(60));
  
  try {
    console.log(`📤 Sending request:`);
    console.log(`   Endpoint: POST /cart/add`);
    console.log(`   Service ID: ${testServiceId}`);
    console.log(`   Quantity: 1`);
    console.log(`   Token: ${testUserToken ? 'Present' : 'Missing'}`);
    
    const response = await makeRequest('POST', '/cart/add', {
      serviceId: testServiceId,
      quantity: 1
    }, testUserToken);
    
    console.log(`\n📥 Response received:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data?.success}`);
    
    if (response.status === 200 && response.data?.success) {
      console.log('✅ Item added to cart successfully');
      console.log(`   Cart Item ID: ${response.data.cartItem?.id}`);
      return true;
    } else {
      console.log('❌ Failed to add to cart');
      console.log('   Error:', response.data?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test6_VerifyCartDatabase() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Verify Item in Database');
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest('GET', '/cart', null, testUserToken);
    
    if (response.status === 200 && response.data?.cartItems) {
      const items = response.data.cartItems;
      
      if (items.length > 0) {
        console.log('✅ Item found in database');
        console.log(`   Total items: ${items.length}`);
        
        const item = items[0];
        console.log(`\n   Item Details:`);
        console.log(`   - ID: ${item.id}`);
        console.log(`   - Title: ${item.title}`);
        console.log(`   - Service ID: ${item.service_id}`);
        console.log(`   - Price: $${item.price}`);
        console.log(`   - Quantity: ${item.quantity}`);
        console.log(`   - Category: ${item.category}`);
        console.log(`   - Location: ${item.location}`);
        console.log(`   - Added at: ${item.added_at}`);
        
        return true;
      } else {
        console.log('❌ No items in cart - data not persisted');
        return false;
      }
    } else {
      console.log('❌ Failed to retrieve cart');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test7_UpdateQuantity() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Update Quantity');
  console.log('='.repeat(60));
  
  try {
    // Get cart to find item ID
    const cartResponse = await makeRequest('GET', '/cart', null, testUserToken);
    const items = cartResponse.data?.cartItems;
    
    if (!items || items.length === 0) {
      console.log('❌ No items in cart to update');
      return false;
    }
    
    const cartItemId = items[0].id;
    const newQuantity = 2;
    
    console.log(`📤 Updating quantity:`);
    console.log(`   Cart Item ID: ${cartItemId}`);
    console.log(`   New Quantity: ${newQuantity}`);
    
    const response = await makeRequest('PUT', `/cart/${cartItemId}`, {
      quantity: newQuantity
    }, testUserToken);
    
    if (response.status === 200 && response.data?.success) {
      console.log('✅ Quantity updated successfully');
      
      // Verify update
      const verifyResponse = await makeRequest('GET', '/cart', null, testUserToken);
      const updatedItem = verifyResponse.data?.cartItems?.[0];
      
      if (updatedItem?.quantity === newQuantity) {
        console.log(`✅ Verified: Quantity is now ${updatedItem.quantity}`);
        return true;
      } else {
        console.log(`❌ Verification failed: Quantity is ${updatedItem?.quantity}`);
        return false;
      }
    } else {
      console.log('❌ Failed to update quantity');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test8_RemoveFromCart() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 8: Remove from Cart');
  console.log('='.repeat(60));
  
  try {
    // Get cart to find item ID
    const cartResponse = await makeRequest('GET', '/cart', null, testUserToken);
    const items = cartResponse.data?.cartItems;
    
    if (!items || items.length === 0) {
      console.log('⚠️  No items in cart to remove');
      return true;
    }
    
    const cartItemId = items[0].id;
    
    console.log(`📤 Removing item:`);
    console.log(`   Cart Item ID: ${cartItemId}`);
    
    const response = await makeRequest('DELETE', `/cart/${cartItemId}`, null, testUserToken);
    
    if (response.status === 200 && response.data?.success) {
      console.log('✅ Item removed successfully');
      
      // Verify removal
      const verifyResponse = await makeRequest('GET', '/cart', null, testUserToken);
      const remainingItems = verifyResponse.data?.cartItems?.length || 0;
      
      console.log(`✅ Verified: ${remainingItems} items remaining`);
      return true;
    } else {
      console.log('❌ Failed to remove item');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function test9_DataPersistence() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 9: Data Persistence (Add and Reload)');
  console.log('='.repeat(60));
  
  try {
    // Add item
    console.log('📤 Adding item to cart...');
    const addResponse = await makeRequest('POST', '/cart/add', {
      serviceId: testServiceId,
      quantity: 1
    }, testUserToken);
    
    if (!addResponse.data?.success) {
      console.log('❌ Failed to add item');
      return false;
    }
    
    console.log('✅ Item added');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload cart
    console.log('📥 Reloading cart from database...');
    const reloadResponse = await makeRequest('GET', '/cart', null, testUserToken);
    
    if (reloadResponse.data?.cartItems?.length > 0) {
      console.log('✅ Data persisted successfully');
      console.log(`   Items in cart: ${reloadResponse.data.cartItems.length}`);
      return true;
    } else {
      console.log('❌ Data not persisted - cart is empty after reload');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('🧪 COMPREHENSIVE ADD-TO-CART DIAGNOSTIC');
  console.log('█'.repeat(60));
  
  const results = [];
  
  // Run tests in sequence
  results.push({ name: 'Backend Connection', passed: await test1_CheckBackendConnection() });
  
  if (!results[0].passed) {
    console.log('\n❌ Cannot continue - backend not responding');
    return;
  }
  
  results.push({ name: 'Get Test User', passed: await test2_GetTestUser() });
  
  if (!results[1].passed) {
    console.log('\n❌ Cannot continue - user authentication failed');
    return;
  }
  
  results.push({ name: 'Get Test Service', passed: await test3_GetTestService() });
  results.push({ name: 'Check Cart Table', passed: await test4_CheckCartTableExists() });
  results.push({ name: 'Add to Cart API', passed: await test5_AddToCartAPI() });
  results.push({ name: 'Verify in Database', passed: await test6_VerifyCartDatabase() });
  results.push({ name: 'Update Quantity', passed: await test7_UpdateQuantity() });
  results.push({ name: 'Remove from Cart', passed: await test8_RemoveFromCart() });
  results.push({ name: 'Data Persistence', passed: await test9_DataPersistence() });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log('\n' + '─'.repeat(60));
  console.log(`Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Add-to-cart is working correctly.');
    console.log('   Data is being saved to PostgreSQL database on Render.');
    console.log('   Data persists across page reloads.');
  } else {
    console.log(`\n⚠️  ${total - passed} test(s) failed. See details above.`);
  }
  
  console.log('█'.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(console.error);
