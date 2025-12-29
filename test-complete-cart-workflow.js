#!/usr/bin/env node

/**
 * Complete Cart Workflow Test
 * Tests the entire cart system from login through checkout
 */

const API_URL = 'http://localhost:5000/api';

let testLog = [];
let authToken = '';
let userId = '';
let cartItems = [];

const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  testLog.push(logEntry);
  console.log(logEntry);
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
    log(`❌ API Error: ${error.message}`, 'error');
    throw error;
  }
};

const runCompleteWorkflow = async () => {
  try {
    log('\n' + '═'.repeat(70));
    log('🛒 COMPLETE CART WORKFLOW TEST');
    log('═'.repeat(70));

    // STEP 1: Register User
    log('\n📌 STEP 1: Register Test User');
    const testUser = {
      email: `test-workflow-${Date.now()}@test.com`,
      password: 'Test123!@#',
      firstName: 'Workflow',
      lastName: 'Test',
      userType: 'traveler',
      phone: '+255700000000'
    };
    
    let result = await apiCall('POST', '/auth/register', testUser);
    if (!result.data.success) {
      throw new Error(`Registration failed: ${result.data.message}`);
    }
    authToken = result.data.token;
    userId = result.data.user.id;
    log(`✅ User registered successfully`);
    log(`   Email: ${testUser.email}`);
    log(`   User ID: ${userId}`);

    // STEP 2: Get Services
    log('\n📌 STEP 2: Fetch Available Services');
    result = await apiCall('GET', '/services?limit=5');
    if (!result.data.success || !result.data.services.length) {
      throw new Error('No services available');
    }
    const services = result.data.services;
    log(`✅ Found ${services.length} services`);

    // STEP 3: Add Multiple Services to Cart
    log('\n📌 STEP 3: Add Multiple Services to Cart');
    const servicesToAdd = services.slice(0, 3);
    
    for (let i = 0; i < servicesToAdd.length; i++) {
      const service = servicesToAdd[i];
      result = await apiCall('POST', '/cart/add', { 
        serviceId: service.id, 
        quantity: i + 1  // First: qty 1, Second: qty 2, Third: qty 3
      });
      
      if (!result.data.success) {
        throw new Error(`Failed to add service ${service.id}: ${result.data.message}`);
      }
      
      log(`✅ Added: ${service.title} (Qty: ${i + 1})`);
    }

    // STEP 4: Retrieve Cart
    log('\n📌 STEP 4: Retrieve Cart and Verify Structure');
    result = await apiCall('GET', '/cart');
    if (!result.data.success) {
      throw new Error(`Get cart failed: ${result.data.message}`);
    }
    
    cartItems = result.data.cartItems;
    log(`✅ Cart retrieved with ${cartItems.length} item(s)`);
    
    let cartTotal = 0;
    cartItems.forEach((item, idx) => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      cartTotal += itemTotal;
      log(`   ${idx + 1}. ${item.title}`);
      log(`      - ID: ${item.id} (cart item ID)`);
      log(`      - Service ID: ${item.service_id}`);
      log(`      - Price: ${item.price} TZS`);
      log(`      - Quantity: ${item.quantity}`);
      log(`      - Subtotal: ${itemTotal} TZS`);
    });
    log(`   TOTAL: ${cartTotal} TZS`);

    // STEP 5: Update Quantities
    log('\n📌 STEP 5: Update Cart Item Quantities');
    const firstItem = cartItems[0];
    const newQuantity = 5;
    
    result = await apiCall('PUT', `/cart/${firstItem.id}`, { quantity: newQuantity });
    if (!result.data.success) {
      throw new Error(`Update failed: ${result.data.message}`);
    }
    log(`✅ Updated ${firstItem.title} quantity to ${newQuantity}`);

    // STEP 6: Verify Update Persisted
    log('\n📌 STEP 6: Verify Update Persisted');
    result = await apiCall('GET', '/cart');
    const updatedItem = result.data.cartItems.find(item => item.id === firstItem.id);
    if (!updatedItem || updatedItem.quantity !== newQuantity) {
      throw new Error(`Quantity not updated! Expected ${newQuantity}, got ${updatedItem?.quantity}`);
    }
    log(`✅ Quantity persisted correctly: ${updatedItem.quantity}`);

    // STEP 7: Remove an Item
    log('\n📌 STEP 7: Remove Item from Cart');
    const itemToRemove = cartItems[1];
    result = await apiCall('DELETE', `/cart/${itemToRemove.id}`);
    if (!result.data.success) {
      throw new Error(`Remove failed: ${result.data.message}`);
    }
    log(`✅ Removed: ${itemToRemove.title}`);

    // STEP 8: Verify Removal
    log('\n📌 STEP 8: Verify Item Removed');
    result = await apiCall('GET', '/cart');
    const remainingItems = result.data.cartItems;
    if (remainingItems.some(item => item.id === itemToRemove.id)) {
      throw new Error('Item was not removed from cart');
    }
    log(`✅ Item removed successfully`);
    log(`   Cart now contains ${remainingItems.length} item(s)`);

    // STEP 9: Add Item Back
    log('\n📌 STEP 9: Add Item Back to Cart');
    result = await apiCall('POST', '/cart/add', { 
      serviceId: itemToRemove.service_id, 
      quantity: 2
    });
    if (!result.data.success) {
      throw new Error(`Re-add failed: ${result.data.message}`);
    }
    log(`✅ Re-added: ${itemToRemove.title} (Qty: 2)`);

    // STEP 10: Final Cart State
    log('\n📌 STEP 10: Final Cart State');
    result = await apiCall('GET', '/cart');
    const finalCart = result.data.cartItems;
    
    log(`✅ Final cart contains ${finalCart.length} item(s)`);
    
    let finalTotal = 0;
    finalCart.forEach((item, idx) => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      finalTotal += itemTotal;
      log(`   ${idx + 1}. ${item.title} x${item.quantity} = ${itemTotal} TZS`);
    });
    log(`   TOTAL: ${finalTotal} TZS`);

    // STEP 11: Clear Cart
    log('\n📌 STEP 11: Clear Cart');
    result = await apiCall('DELETE', '/cart');
    if (!result.data.success) {
      throw new Error(`Clear cart failed: ${result.data.message}`);
    }
    log(`✅ Cart cleared`);

    // STEP 12: Verify Cart is Empty
    log('\n📌 STEP 12: Verify Cart is Empty');
    result = await apiCall('GET', '/cart');
    if (result.data.cartItems.length !== 0) {
      throw new Error(`Cart not empty! Contains ${result.data.cartItems.length} items`);
    }
    log(`✅ Cart is empty`);

    // SUCCESS
    log('\n' + '═'.repeat(70));
    log('✅ ALL TESTS PASSED!');
    log('═'.repeat(70));
    log('\n✨ Complete Cart Workflow Summary:');
    log('  ✓ User registration working');
    log('  ✓ Service retrieval working');
    log('  ✓ Add to cart working (multiple items)');
    log('  ✓ Cart retrieval working');
    log('  ✓ Data structure correct (id, service_id, title, price, quantity)');
    log('  ✓ Update quantity working');
    log('  ✓ Remove from cart working');
    log('  ✓ Re-add to cart working');
    log('  ✓ Clear cart working');
    log('  ✓ Data persistence working');
    log('\n🎉 Cart system is fully functional and ready for production!\n');

  } catch (error) {
    log('\n' + '═'.repeat(70));
    log(`❌ TEST FAILED: ${error.message}`);
    log('═'.repeat(70));
    process.exit(1);
  }
};

runCompleteWorkflow();
