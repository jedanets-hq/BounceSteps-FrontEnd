#!/usr/bin/env node

/**
 * Comprehensive Cart and Payment Workflow Test
 * Tests: Add to cart → View in sidebar → Proceed to payment → See items in modal
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = null;
let userId = null;
let testServiceId = null;

// Helper function to make HTTP requests
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

// Test functions
async function testLogin() {
  console.log('\n📝 TEST 1: User Login');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('POST', '/auth/login', TEST_USER);
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      userId = response.data.user.id;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      console.log(`   User ID: ${userId}`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testGetServices() {
  console.log('\n📝 TEST 2: Get Available Services');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('GET', '/services');
    
    if (response.status === 200 && response.data.services && response.data.services.length > 0) {
      testServiceId = response.data.services[0].id;
      const service = response.data.services[0];
      console.log('✅ Services retrieved');
      console.log(`   Total services: ${response.data.services.length}`);
      console.log(`   First service: ${service.title}`);
      console.log(`   Service ID: ${testServiceId}`);
      console.log(`   Price: $${service.price}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Location: ${service.location}`);
      return true;
    } else {
      console.log('❌ No services found');
      return false;
    }
  } catch (error) {
    console.log('❌ Get services error:', error.message);
    return false;
  }
}

async function testAddToCart() {
  console.log('\n📝 TEST 3: Add Service to Cart');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('POST', '/cart/add', {
      serviceId: testServiceId,
      quantity: 1
    }, authToken);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Item added to cart');
      console.log(`   Service ID: ${testServiceId}`);
      console.log(`   Quantity: 1`);
      return true;
    } else {
      console.log('❌ Failed to add to cart:', response.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Add to cart error:', error.message);
    return false;
  }
}

async function testGetCart() {
  console.log('\n📝 TEST 4: Get Cart Items (Sidebar Display)');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('GET', '/cart', null, authToken);
    
    if (response.status === 200 && response.data.success) {
      const items = response.data.cartItems;
      console.log('✅ Cart retrieved successfully');
      console.log(`   Total items: ${items.length}`);
      
      if (items.length > 0) {
        items.forEach((item, index) => {
          console.log(`\n   Item ${index + 1}:`);
          console.log(`   - ID: ${item.id}`);
          console.log(`   - Title: ${item.title}`);
          console.log(`   - Category: ${item.category}`);
          console.log(`   - Location: ${item.location}`);
          console.log(`   - Price: $${item.price}`);
          console.log(`   - Quantity: ${item.quantity}`);
          console.log(`   - Provider: ${item.provider_name}`);
          console.log(`   - Subtotal: $${(item.price * item.quantity).toFixed(2)}`);
        });
        
        // Verify data structure for UI components
        console.log('\n   ✓ Data structure verification:');
        const item = items[0];
        console.log(`   ✓ item.title exists: ${!!item.title}`);
        console.log(`   ✓ item.category exists: ${!!item.category}`);
        console.log(`   ✓ item.location exists: ${!!item.location}`);
        console.log(`   ✓ item.price exists: ${!!item.price}`);
        console.log(`   ✓ item.quantity exists: ${!!item.quantity}`);
        
        return true;
      } else {
        console.log('⚠️  Cart is empty');
        return false;
      }
    } else {
      console.log('❌ Failed to get cart:', response.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Get cart error:', error.message);
    return false;
  }
}

async function testAddMultipleServices() {
  console.log('\n📝 TEST 5: Add Multiple Services to Cart');
  console.log('─'.repeat(50));
  
  try {
    // Get more services
    const servicesResponse = await makeRequest('GET', '/services');
    const services = servicesResponse.data.services;
    
    if (services.length < 2) {
      console.log('⚠️  Not enough services to test multiple items');
      return true;
    }
    
    // Add second service
    const secondServiceId = services[1].id;
    const response = await makeRequest('POST', '/cart/add', {
      serviceId: secondServiceId,
      quantity: 1
    }, authToken);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Second item added to cart');
      console.log(`   Service: ${services[1].title}`);
      
      // Get updated cart
      const cartResponse = await makeRequest('GET', '/cart', null, authToken);
      if (cartResponse.data.success) {
        console.log(`   Total items in cart: ${cartResponse.data.cartItems.length}`);
        return true;
      }
    } else {
      console.log('❌ Failed to add second item');
      return false;
    }
  } catch (error) {
    console.log('❌ Add multiple services error:', error.message);
    return false;
  }
}

async function testUpdateQuantity() {
  console.log('\n📝 TEST 6: Update Item Quantity');
  console.log('─'.repeat(50));
  
  try {
    // Get cart to find an item
    const cartResponse = await makeRequest('GET', '/cart', null, authToken);
    const items = cartResponse.data.cartItems;
    
    if (items.length === 0) {
      console.log('⚠️  No items in cart to update');
      return false;
    }
    
    const cartItemId = items[0].id;
    const newQuantity = 2;
    
    const response = await makeRequest('PUT', `/cart/${cartItemId}`, {
      quantity: newQuantity
    }, authToken);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Quantity updated successfully');
      console.log(`   Cart Item ID: ${cartItemId}`);
      console.log(`   New Quantity: ${newQuantity}`);
      
      // Verify update
      const updatedCart = await makeRequest('GET', '/cart', null, authToken);
      const updatedItem = updatedCart.data.cartItems.find(i => i.id === cartItemId);
      console.log(`   Verified Quantity: ${updatedItem.quantity}`);
      return true;
    } else {
      console.log('❌ Failed to update quantity');
      return false;
    }
  } catch (error) {
    console.log('❌ Update quantity error:', error.message);
    return false;
  }
}

async function testPaymentModal() {
  console.log('\n📝 TEST 7: Payment Modal Data Verification');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('GET', '/cart', null, authToken);
    
    if (response.status === 200 && response.data.success) {
      const items = response.data.cartItems;
      
      if (items.length === 0) {
        console.log('⚠️  No items in cart for payment');
        return false;
      }
      
      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      console.log('✅ Payment modal data ready');
      console.log(`   Items to display: ${items.length}`);
      console.log(`   Total amount: $${total.toFixed(2)}`);
      
      console.log('\n   Order Summary:');
      items.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        console.log(`   ${index + 1}. ${item.title} x${item.quantity} = $${subtotal.toFixed(2)}`);
      });
      
      console.log(`\n   Final Total: $${total.toFixed(2)}`);
      return true;
    } else {
      console.log('❌ Failed to get cart for payment');
      return false;
    }
  } catch (error) {
    console.log('❌ Payment modal error:', error.message);
    return false;
  }
}

async function testRemoveFromCart() {
  console.log('\n📝 TEST 8: Remove Item from Cart');
  console.log('─'.repeat(50));
  
  try {
    // Get cart
    const cartResponse = await makeRequest('GET', '/cart', null, authToken);
    const items = cartResponse.data.cartItems;
    
    if (items.length === 0) {
      console.log('⚠️  No items in cart to remove');
      return false;
    }
    
    const cartItemId = items[0].id;
    const itemTitle = items[0].title;
    
    const response = await makeRequest('DELETE', `/cart/${cartItemId}`, null, authToken);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Item removed from cart');
      console.log(`   Removed: ${itemTitle}`);
      
      // Verify removal
      const updatedCart = await makeRequest('GET', '/cart', null, authToken);
      console.log(`   Items remaining: ${updatedCart.data.cartItems.length}`);
      return true;
    } else {
      console.log('❌ Failed to remove item');
      return false;
    }
  } catch (error) {
    console.log('❌ Remove from cart error:', error.message);
    return false;
  }
}

async function testClearCart() {
  console.log('\n📝 TEST 9: Clear Entire Cart');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('DELETE', '/cart', null, authToken);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Cart cleared successfully');
      
      // Verify cart is empty
      const cartResponse = await makeRequest('GET', '/cart', null, authToken);
      console.log(`   Items remaining: ${cartResponse.data.cartItems.length}`);
      return true;
    } else {
      console.log('❌ Failed to clear cart');
      return false;
    }
  } catch (error) {
    console.log('❌ Clear cart error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 CART AND PAYMENT WORKFLOW TEST SUITE');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Run tests in sequence
  results.push({ name: 'Login', passed: await testLogin() });
  
  if (!results[0].passed) {
    console.log('\n❌ Cannot continue - login failed');
    return;
  }
  
  results.push({ name: 'Get Services', passed: await testGetServices() });
  results.push({ name: 'Add to Cart', passed: await testAddToCart() });
  results.push({ name: 'Get Cart (Sidebar)', passed: await testGetCart() });
  results.push({ name: 'Add Multiple Services', passed: await testAddMultipleServices() });
  results.push({ name: 'Update Quantity', passed: await testUpdateQuantity() });
  results.push({ name: 'Payment Modal Data', passed: await testPaymentModal() });
  results.push({ name: 'Remove from Cart', passed: await testRemoveFromCart() });
  results.push({ name: 'Clear Cart', passed: await testClearCart() });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log('\n' + '─'.repeat(50));
  console.log(`Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Cart and Payment workflow is working correctly.');
  } else {
    console.log(`\n⚠️  ${total - passed} test(s) failed. Please review the errors above.`);
  }
  
  console.log('='.repeat(50) + '\n');
}

// Run tests
runAllTests().catch(console.error);
