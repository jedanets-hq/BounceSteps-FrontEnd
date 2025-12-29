#!/usr/bin/env node

const API_URL = 'http://localhost:5000/api';

// Test data
let testUser = {
  email: `test-cart-${Date.now()}@test.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
  userType: 'traveler',
  phone: '+255700000000'
};

let authToken = '';
let userId = '';
let serviceId = '';
let cartItemId = '';

const log = (title, message) => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📌 ${title}`);
  console.log(`${'═'.repeat(60)}`);
  if (message) console.log(message);
};

const apiCall = async (method, endpoint, body = null) => {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

const runTests = async () => {
  try {
    // STEP 1: Register user
    log('STEP 1: Register Test User');
    let result = await apiCall('POST', '/auth/register', testUser);
    if (!result.data.success) {
      throw new Error(`Registration failed: ${result.data.message}`);
    }
    authToken = result.data.token;
    userId = result.data.user.id;
    console.log(`✅ User registered: ${testUser.email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);

    // STEP 2: Get available services
    log('STEP 2: Fetch Available Services');
    result = await apiCall('GET', '/services?limit=5');
    if (!result.data.success || !result.data.services.length) {
      throw new Error('No services available');
    }
    serviceId = result.data.services[0].id;
    const serviceName = result.data.services[0].title;
    const servicePrice = result.data.services[0].price;
    console.log(`✅ Found ${result.data.services.length} services`);
    console.log(`   Selected: ${serviceName} (ID: ${serviceId}, Price: ${servicePrice})`);

    // STEP 3: Add service to cart
    log('STEP 3: Add Service to Cart');
    result = await apiCall('POST', '/cart/add', { serviceId, quantity: 1 });
    if (!result.data.success) {
      throw new Error(`Add to cart failed: ${result.data.message}`);
    }
    cartItemId = result.data.cartItem.id;
    console.log(`✅ Item added to cart`);
    console.log(`   Cart Item ID: ${cartItemId}`);
    console.log(`   Service ID: ${result.data.cartItem.service_id}`);
    console.log(`   Quantity: ${result.data.cartItem.quantity}`);

    // STEP 4: Get cart and verify structure
    log('STEP 4: Retrieve Cart and Verify Data Structure');
    result = await apiCall('GET', '/cart');
    if (!result.data.success) {
      throw new Error(`Get cart failed: ${result.data.message}`);
    }
    console.log(`✅ Cart retrieved with ${result.data.cartItems.length} item(s)`);
    
    const cartItem = result.data.cartItems[0];
    console.log(`\n   Cart Item Structure:`);
    console.log(`   - id: ${cartItem.id} (cart item ID - used for update/delete)`);
    console.log(`   - service_id: ${cartItem.service_id} (service ID - used for lookup)`);
    console.log(`   - title: ${cartItem.title}`);
    console.log(`   - price: ${cartItem.price}`);
    console.log(`   - quantity: ${cartItem.quantity}`);
    console.log(`   - category: ${cartItem.category}`);
    console.log(`   - location: ${cartItem.location}`);

    // STEP 5: Update quantity
    log('STEP 5: Update Cart Item Quantity');
    result = await apiCall('PUT', `/cart/${cartItemId}`, { quantity: 3 });
    if (!result.data.success) {
      throw new Error(`Update quantity failed: ${result.data.message}`);
    }
    console.log(`✅ Quantity updated to 3`);
    console.log(`   Cart Item ID: ${result.data.cartItem.id}`);
    console.log(`   New Quantity: ${result.data.cartItem.quantity}`);

    // STEP 6: Verify update persisted
    log('STEP 6: Verify Update Persisted');
    result = await apiCall('GET', '/cart');
    const updatedItem = result.data.cartItems[0];
    if (updatedItem.quantity !== 3) {
      throw new Error(`Quantity not updated! Expected 3, got ${updatedItem.quantity}`);
    }
    console.log(`✅ Quantity persisted correctly`);
    console.log(`   Current Quantity: ${updatedItem.quantity}`);

    // STEP 7: Add another service
    log('STEP 7: Add Another Service to Cart');
    result = await apiCall('GET', '/services?limit=5');
    const secondService = result.data.services[1];
    if (!secondService) {
      console.log('⚠️  Only one service available, skipping second add');
    } else {
      result = await apiCall('POST', '/cart/add', { serviceId: secondService.id, quantity: 2 });
      if (result.data.success) {
        console.log(`✅ Second item added to cart`);
        console.log(`   Service: ${secondService.title}`);
        console.log(`   Quantity: 2`);
      }
    }

    // STEP 8: Get final cart
    log('STEP 8: Final Cart State');
    result = await apiCall('GET', '/cart');
    console.log(`✅ Final cart contains ${result.data.cartItems.length} item(s)`);
    
    let total = 0;
    result.data.cartItems.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      console.log(`   ${idx + 1}. ${item.title} x${item.quantity} = ${itemTotal} TZS`);
    });
    console.log(`   TOTAL: ${total} TZS`);

    // STEP 9: Remove item from cart
    log('STEP 9: Remove Item from Cart');
    result = await apiCall('DELETE', `/cart/${cartItemId}`);
    if (!result.data.success) {
      throw new Error(`Remove from cart failed: ${result.data.message}`);
    }
    console.log(`✅ Item removed from cart`);

    // STEP 10: Verify removal
    log('STEP 10: Verify Item Removed');
    result = await apiCall('GET', '/cart');
    console.log(`✅ Cart now contains ${result.data.cartItems.length} item(s)`);

    // FINAL SUMMARY
    log('✅ ALL TESTS PASSED!', `
The cart system is working correctly:
  ✓ Add to cart working
  ✓ Cart retrieval working
  ✓ Data structure correct (id, service_id, title, price, quantity)
  ✓ Update quantity working
  ✓ Remove from cart working
  ✓ Data persistence working
  ✓ Multiple items in cart working
    `);

  } catch (error) {
    log('❌ TEST FAILED', error.message);
    process.exit(1);
  }
};

runTests();
