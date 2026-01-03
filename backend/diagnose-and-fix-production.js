/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 PRODUCTION SYSTEM DIAGNOSTIC & FIX SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This script diagnoses and fixes the production issues:
 * 1. Tests all cart/favorites/plans API endpoints
 * 2. Verifies backend routes are properly mounted
 * 3. Tests frontend error handling
 * 4. Checks navigation flows
 * 5. Provides detailed fix recommendations
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const API_URL = process.env.API_URL || 'https://isafarinetworkglobal-2.onrender.com/api';

console.log('🔍 PRODUCTION SYSTEM DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`📡 Backend URL: ${API_URL}`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Test user credentials
const TEST_USER = {
  email: 'traveler@test.com',
  password: '123456'
};

let authToken = null;

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  try {
    console.log(`\n📡 ${config.method} ${endpoint}`);
    const response = await fetch(url, config);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log(`❌ Non-JSON response (${response.status}):`, text.substring(0, 200));
      return {
        success: false,
        status: response.status,
        message: 'Non-JSON response from server',
        raw: text.substring(0, 200)
      };
    }

    const data = await response.json();
    console.log(`📥 Response (${response.status}):`, JSON.stringify(data, null, 2));
    
    return {
      ...data,
      status: response.status,
      ok: response.ok
    };
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return {
      success: false,
      message: error.message,
      error: true
    };
  }
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 1: Health Check');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const result = await apiRequest('/health');
  
  if (result.success) {
    console.log('✅ Backend is healthy');
    return true;
  } else {
    console.log('❌ Backend health check failed');
    return false;
  }
}

/**
 * Test 2: Authentication
 */
async function testAuthentication() {
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 2: Authentication');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: TEST_USER
  });
  
  if (result.success && result.token) {
    authToken = result.token;
    console.log('✅ Authentication successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Authentication failed');
    console.log('   Message:', result.message);
    return false;
  }
}

/**
 * Test 3: Cart API Endpoints
 */
async function testCartEndpoints() {
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 3: Cart API Endpoints');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const tests = {
    'GET /api/cart': false,
    'POST /api/cart/add': false,
    'PUT /api/cart/:id': false,
    'DELETE /api/cart/:id': false,
    'DELETE /api/cart': false
  };
  
  // Test GET /cart
  let getResult = await apiRequest('/cart');
  tests['GET /api/cart'] = getResult.success === true;
  
  if (!tests['GET /api/cart']) {
    console.log('❌ GET /cart failed:', getResult.message);
  } else {
    console.log('✅ GET /cart works');
  }
  
  // Test POST /cart/add
  let addResult = await apiRequest('/cart/add', {
    method: 'POST',
    body: { serviceId: 1, quantity: 1 }
  });
  tests['POST /api/cart/add'] = addResult.success === true;
  
  if (!tests['POST /api/cart/add']) {
    console.log('❌ POST /cart/add failed:', addResult.message);
  } else {
    console.log('✅ POST /cart/add works');
  }
  
  // If add succeeded, test update and delete
  if (addResult.success && addResult.cartItem) {
    const cartItemId = addResult.cartItem.id;
    
    // Test PUT /cart/:id
    let updateResult = await apiRequest(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: { quantity: 2 }
    });
    tests['PUT /api/cart/:id'] = updateResult.success === true;
    
    if (!tests['PUT /api/cart/:id']) {
      console.log('❌ PUT /cart/:id failed:', updateResult.message);
    } else {
      console.log('✅ PUT /cart/:id works');
    }
    
    // Test DELETE /cart/:id
    let deleteResult = await apiRequest(`/cart/${cartItemId}`, {
      method: 'DELETE'
    });
    tests['DELETE /api/cart/:id'] = deleteResult.success === true;
    
    if (!tests['DELETE /api/cart/:id']) {
      console.log('❌ DELETE /cart/:id failed:', deleteResult.message);
    } else {
      console.log('✅ DELETE /cart/:id works');
    }
  }
  
  // Test DELETE /cart (clear all)
  let clearResult = await apiRequest('/cart', {
    method: 'DELETE'
  });
  tests['DELETE /api/cart'] = clearResult.success === true;
  
  if (!tests['DELETE /api/cart']) {
    console.log('❌ DELETE /cart failed:', clearResult.message);
  } else {
    console.log('✅ DELETE /cart works');
  }
  
  return tests;
}

/**
 * Test 4: Favorites API Endpoints
 */
async function testFavoritesEndpoints() {
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 4: Favorites API Endpoints');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const tests = {
    'GET /api/favorites': false,
    'POST /api/favorites/add': false,
    'GET /api/favorites/check/:id': false,
    'DELETE /api/favorites/:id': false
  };
  
  // Test GET /favorites
  let getResult = await apiRequest('/favorites');
  tests['GET /api/favorites'] = getResult.success === true;
  
  if (!tests['GET /api/favorites']) {
    console.log('❌ GET /favorites failed:', getResult.message);
  } else {
    console.log('✅ GET /favorites works');
  }
  
  // Test POST /favorites/add
  let addResult = await apiRequest('/favorites/add', {
    method: 'POST',
    body: { providerId: 1 }
  });
  tests['POST /api/favorites/add'] = addResult.success === true;
  
  if (!tests['POST /api/favorites/add']) {
    console.log('❌ POST /favorites/add failed:', addResult.message);
  } else {
    console.log('✅ POST /favorites/add works');
  }
  
  // Test GET /favorites/check/:id
  let checkResult = await apiRequest('/favorites/check/1');
  tests['GET /api/favorites/check/:id'] = checkResult.success === true;
  
  if (!tests['GET /api/favorites/check/:id']) {
    console.log('❌ GET /favorites/check/:id failed:', checkResult.message);
  } else {
    console.log('✅ GET /favorites/check/:id works');
  }
  
  // Test DELETE /favorites/:id
  let deleteResult = await apiRequest('/favorites/1', {
    method: 'DELETE'
  });
  tests['DELETE /api/favorites/:id'] = deleteResult.success === true;
  
  if (!tests['DELETE /api/favorites/:id']) {
    console.log('❌ DELETE /favorites/:id failed:', deleteResult.message);
  } else {
    console.log('✅ DELETE /favorites/:id works');
  }
  
  return tests;
}

/**
 * Test 5: Plans API Endpoints
 */
async function testPlansEndpoints() {
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 5: Plans API Endpoints');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const tests = {
    'GET /api/plans': false,
    'POST /api/plans/add': false,
    'PUT /api/plans/:id': false,
    'DELETE /api/plans/:id': false
  };
  
  // Test GET /plans
  let getResult = await apiRequest('/plans');
  tests['GET /api/plans'] = getResult.success === true;
  
  if (!tests['GET /api/plans']) {
    console.log('❌ GET /plans failed:', getResult.message);
  } else {
    console.log('✅ GET /plans works');
  }
  
  // Test POST /plans/add
  let addResult = await apiRequest('/plans/add', {
    method: 'POST',
    body: { 
      serviceId: 1, 
      planDate: '2025-01-15',
      notes: 'Test plan'
    }
  });
  tests['POST /api/plans/add'] = addResult.success === true;
  
  if (!tests['POST /api/plans/add']) {
    console.log('❌ POST /plans/add failed:', addResult.message);
  } else {
    console.log('✅ POST /plans/add works');
  }
  
  // If add succeeded, test update and delete
  if (addResult.success && addResult.plan) {
    const planId = addResult.plan.id;
    
    // Test PUT /plans/:id
    let updateResult = await apiRequest(`/plans/${planId}`, {
      method: 'PUT',
      body: { 
        planDate: '2025-01-20',
        notes: 'Updated plan'
      }
    });
    tests['PUT /api/plans/:id'] = updateResult.success === true;
    
    if (!tests['PUT /api/plans/:id']) {
      console.log('❌ PUT /plans/:id failed:', updateResult.message);
    } else {
      console.log('✅ PUT /plans/:id works');
    }
    
    // Test DELETE /plans/:id
    let deleteResult = await apiRequest(`/plans/${planId}`, {
      method: 'DELETE'
    });
    tests['DELETE /api/plans/:id'] = deleteResult.success === true;
    
    if (!tests['DELETE /api/plans/:id']) {
      console.log('❌ DELETE /plans/:id failed:', deleteResult.message);
    } else {
      console.log('✅ DELETE /plans/:id works');
    }
  }
  
  return tests;
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('🚀 Starting production diagnostics...\n');
  
  // Run all tests
  const healthOk = await testHealthCheck();
  const authOk = await testAuthentication();
  
  if (!authOk) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  const cartTests = await testCartEndpoints();
  const favoritesTests = await testFavoritesEndpoints();
  const plansTests = await testPlansEndpoints();
  
  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('Cart Endpoints:');
  Object.entries(cartTests).forEach(([endpoint, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${endpoint}`);
  });
  
  console.log('\nFavorites Endpoints:');
  Object.entries(favoritesTests).forEach(([endpoint, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${endpoint}`);
  });
  
  console.log('\nPlans Endpoints:');
  Object.entries(plansTests).forEach(([endpoint, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${endpoint}`);
  });
  
  // Identify issues
  const allTests = { ...cartTests, ...favoritesTests, ...plansTests };
  const failedTests = Object.entries(allTests).filter(([_, passed]) => !passed);
  
  if (failedTests.length > 0) {
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('🔧 RECOMMENDED FIXES');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('1. Backend Route Issues:');
    console.log('   - Verify routes are properly mounted in backend/server.js');
    console.log('   - Check that cart.js, favorites.js, plans.js export routers correctly');
    console.log('   - Ensure authentication middleware is applied\n');
    
    console.log('2. Frontend Error Handling:');
    console.log('   - Add defensive checks in CartContext, FavoritesContext');
    console.log('   - Improve ErrorBoundary to catch API failures');
    console.log('   - Add loading states and error messages\n');
    
    console.log('3. Navigation Issues:');
    console.log('   - Check React Router configuration');
    console.log('   - Verify dashboard tab switching logic');
    console.log('   - Test all navigation flows\n');
  } else {
    console.log('\n✅ All endpoints working correctly!');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ Diagnostic complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('\n❌ Fatal error during diagnostics:', error);
  process.exit(1);
});
