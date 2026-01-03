/**
 * Test script to verify data persistence implementation
 * Run this after deploying to test all endpoints
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

// Test user credentials (create a test user first)
const TEST_USER = {
  email: 'test@isafari.com',
  password: 'test123456'
};

let authToken = null;
let userId = null;

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
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
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing Login...');
  const result = await apiRequest('/auth/login', 'POST', TEST_USER);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    userId = result.data.user.id;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`   Error: ${result.data?.message || result.error}`);
    return false;
  }
}

async function testCartAPI() {
  console.log('\n📦 Testing Cart API...');
  
  // Get cart
  console.log('  1. Getting cart...');
  let result = await apiRequest('/cart');
  if (result.success) {
    console.log(`     ✅ Got cart with ${result.data.cartItems?.length || 0} items`);
  } else {
    console.log(`     ❌ Failed to get cart: ${result.data?.message}`);
    return false;
  }

  // Add to cart
  console.log('  2. Adding item to cart...');
  result = await apiRequest('/cart/add', 'POST', { serviceId: 1, quantity: 1 });
  if (result.success) {
    console.log('     ✅ Item added to cart');
  } else {
    console.log(`     ❌ Failed to add to cart: ${result.data?.message}`);
    return false;
  }

  // Get cart again
  console.log('  3. Verifying item in cart...');
  result = await apiRequest('/cart');
  if (result.success && result.data.cartItems?.length > 0) {
    console.log(`     ✅ Cart now has ${result.data.cartItems.length} items`);
  } else {
    console.log('     ❌ Item not found in cart');
    return false;
  }

  // Clear cart
  console.log('  4. Clearing cart...');
  result = await apiRequest('/cart', 'DELETE');
  if (result.success) {
    console.log('     ✅ Cart cleared');
  } else {
    console.log(`     ❌ Failed to clear cart: ${result.data?.message}`);
    return false;
  }

  return true;
}

async function testPlansAPI() {
  console.log('\n📅 Testing Plans API...');
  
  // Get plans
  console.log('  1. Getting plans...');
  let result = await apiRequest('/plans');
  if (result.success) {
    console.log(`     ✅ Got plans with ${result.data.plans?.length || 0} items`);
  } else {
    console.log(`     ❌ Failed to get plans: ${result.data?.message}`);
    return false;
  }

  // Add to plan
  console.log('  2. Adding service to plan...');
  result = await apiRequest('/plans/add', 'POST', {
    serviceId: 1,
    planDate: new Date().toISOString().split('T')[0],
    notes: 'Test plan'
  });
  if (result.success) {
    console.log('     ✅ Service added to plan');
  } else {
    console.log(`     ❌ Failed to add to plan: ${result.data?.message}`);
    return false;
  }

  // Get plans again
  console.log('  3. Verifying service in plan...');
  result = await apiRequest('/plans');
  if (result.success && result.data.plans?.length > 0) {
    console.log(`     ✅ Plans now has ${result.data.plans.length} items`);
  } else {
    console.log('     ❌ Service not found in plans');
    return false;
  }

  // Clear plans
  console.log('  4. Clearing plans...');
  result = await apiRequest('/plans', 'DELETE');
  if (result.success) {
    console.log('     ✅ Plans cleared');
  } else {
    console.log(`     ❌ Failed to clear plans: ${result.data?.message}`);
    return false;
  }

  return true;
}

async function testFavoritesAPI() {
  console.log('\n⭐ Testing Favorites API...');
  
  // Get favorites
  console.log('  1. Getting favorites...');
  let result = await apiRequest('/favorites');
  if (result.success) {
    console.log(`     ✅ Got favorites with ${result.data.favorites?.length || 0} items`);
  } else {
    console.log(`     ❌ Failed to get favorites: ${result.data?.message}`);
    return false;
  }

  // Add to favorites
  console.log('  2. Adding provider to favorites...');
  result = await apiRequest('/favorites/add', 'POST', { providerId: 1 });
  if (result.success) {
    console.log('     ✅ Provider added to favorites');
  } else {
    console.log(`     ❌ Failed to add to favorites: ${result.data?.message}`);
    return false;
  }

  // Check favorite
  console.log('  3. Checking if provider is favorited...');
  result = await apiRequest('/favorites/check/1');
  if (result.success && result.data.isFavorite) {
    console.log('     ✅ Provider is favorited');
  } else {
    console.log('     ❌ Provider not found in favorites');
    return false;
  }

  // Get favorites again
  console.log('  4. Verifying provider in favorites...');
  result = await apiRequest('/favorites');
  if (result.success && result.data.favorites?.length > 0) {
    console.log(`     ✅ Favorites now has ${result.data.favorites.length} items`);
  } else {
    console.log('     ❌ Provider not found in favorites');
    return false;
  }

  // Remove from favorites
  console.log('  5. Removing provider from favorites...');
  result = await apiRequest('/favorites/1', 'DELETE');
  if (result.success) {
    console.log('     ✅ Provider removed from favorites');
  } else {
    console.log(`     ❌ Failed to remove from favorites: ${result.data?.message}`);
    return false;
  }

  return true;
}

async function testDatabasePersistence() {
  console.log('\n💾 Testing Database Persistence...');
  
  // Add item to cart
  console.log('  1. Adding item to cart...');
  let result = await apiRequest('/cart/add', 'POST', { serviceId: 1, quantity: 1 });
  if (!result.success) {
    console.log('     ❌ Failed to add to cart');
    return false;
  }

  // Simulate page refresh by making new request
  console.log('  2. Simulating page refresh (new request)...');
  result = await apiRequest('/cart');
  if (result.success && result.data.cartItems?.length > 0) {
    console.log('     ✅ Item persisted in database after refresh');
  } else {
    console.log('     ❌ Item not found after refresh');
    return false;
  }

  // Clear for next test
  await apiRequest('/cart', 'DELETE');
  return true;
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Data Persistence Test Suite');
  console.log('================================\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Test User: ${TEST_USER.email}`);

  // Login first
  if (!await testLogin()) {
    console.log('\n❌ Cannot proceed without login');
    return;
  }

  // Run all tests
  const results = {
    cart: await testCartAPI(),
    plans: await testPlansAPI(),
    favorites: await testFavoritesAPI(),
    persistence: await testDatabasePersistence()
  };

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Cart API:        ${results.cart ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Plans API:       ${results.plans ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Favorites API:   ${results.favorites ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Persistence:     ${results.persistence ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run tests
runAllTests().catch(console.error);
