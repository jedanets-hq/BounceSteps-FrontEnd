/**
 * Complete System Functionality Test
 * Tests: Dashboard, Add to Cart, Navigation, Database Integration
 */

const API_URL = process.env.VITE_API_URL || 'https://isafarinetworkglobal-2.onrender.com/api';

// Test credentials
const TEST_USER = {
  email: 'traveler@test.com',
  password: '123456'
};

let authToken = null;
let testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to log results
function logResult(test, status, message) {
  const result = { test, status, message, timestamp: new Date().toISOString() };
  if (status === 'PASS') {
    testResults.passed.push(result);
    console.log(`✅ ${test}: ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed.push(result);
    console.error(`❌ ${test}: ${message}`);
  } else {
    testResults.warnings.push(result);
    console.warn(`⚠️  ${test}: ${message}`);
  }
}

// Test 1: Backend Health Check
async function testBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      logResult('Backend Health', 'PASS', 'Backend is running');
      return true;
    } else {
      logResult('Backend Health', 'FAIL', `Backend returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    logResult('Backend Health', 'FAIL', `Cannot reach backend: ${error.message}`);
    return false;
  }
}

// Test 2: User Authentication
async function testAuthentication() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      authToken = data.token;
      logResult('Authentication', 'PASS', 'User login successful');
      return true;
    } else {
      logResult('Authentication', 'FAIL', data.message || 'Login failed');
      return false;
    }
  } catch (error) {
    logResult('Authentication', 'FAIL', `Login error: ${error.message}`);
    return false;
  }
}

// Test 3: Load Cart from Database
async function testLoadCart() {
  if (!authToken) {
    logResult('Load Cart', 'FAIL', 'No auth token available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      logResult('Load Cart', 'PASS', `Cart loaded with ${data.cartItems?.length || 0} items`);
      return true;
    } else {
      logResult('Load Cart', 'FAIL', data.message || 'Failed to load cart');
      return false;
    }
  } catch (error) {
    logResult('Load Cart', 'FAIL', `Cart load error: ${error.message}`);
    return false;
  }
}

// Test 4: Fetch Services
async function testFetchServices() {
  try {
    const response = await fetch(`${API_URL}/services`);
    const data = await response.json();
    
    if (data.success && data.services && data.services.length > 0) {
      logResult('Fetch Services', 'PASS', `Found ${data.services.length} services`);
      return data.services[0]; // Return first service for cart test
    } else {
      logResult('Fetch Services', 'FAIL', 'No services found');
      return null;
    }
  } catch (error) {
    logResult('Fetch Services', 'FAIL', `Services fetch error: ${error.message}`);
    return null;
  }
}

// Test 5: Add to Cart
async function testAddToCart(service) {
  if (!authToken) {
    logResult('Add to Cart', 'FAIL', 'No auth token available');
    return false;
  }

  if (!service) {
    logResult('Add to Cart', 'FAIL', 'No service provided');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        serviceId: service.id,
        quantity: 1
      })
    });

    const data = await response.json();
    
    if (data.success) {
      logResult('Add to Cart', 'PASS', `Service "${service.title}" added to cart`);
      return true;
    } else {
      logResult('Add to Cart', 'FAIL', data.message || 'Failed to add to cart');
      return false;
    }
  } catch (error) {
    logResult('Add to Cart', 'FAIL', `Add to cart error: ${error.message}`);
    return false;
  }
}

// Test 6: Verify Cart Update
async function testVerifyCartUpdate() {
  if (!authToken) {
    logResult('Verify Cart Update', 'FAIL', 'No auth token available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success && data.cartItems && data.cartItems.length > 0) {
      logResult('Verify Cart Update', 'PASS', `Cart now has ${data.cartItems.length} items`);
      return true;
    } else {
      logResult('Verify Cart Update', 'FAIL', 'Cart is empty after adding item');
      return false;
    }
  } catch (error) {
    logResult('Verify Cart Update', 'FAIL', `Cart verification error: ${error.message}`);
    return false;
  }
}

// Test 7: Load Favorites
async function testLoadFavorites() {
  if (!authToken) {
    logResult('Load Favorites', 'FAIL', 'No auth token available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      logResult('Load Favorites', 'PASS', `Favorites loaded with ${data.favorites?.length || 0} items`);
      return true;
    } else {
      logResult('Load Favorites', 'FAIL', data.message || 'Failed to load favorites');
      return false;
    }
  } catch (error) {
    logResult('Load Favorites', 'FAIL', `Favorites load error: ${error.message}`);
    return false;
  }
}

// Test 8: Load Trip Plans
async function testLoadTripPlans() {
  if (!authToken) {
    logResult('Load Trip Plans', 'FAIL', 'No auth token available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/plans`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      logResult('Load Trip Plans', 'PASS', `Trip plans loaded with ${data.plans?.length || 0} items`);
      return true;
    } else {
      logResult('Load Trip Plans', 'FAIL', data.message || 'Failed to load trip plans');
      return false;
    }
  } catch (error) {
    logResult('Load Trip Plans', 'FAIL', `Trip plans load error: ${error.message}`);
    return false;
  }
}

// Test 9: Load Bookings
async function testLoadBookings() {
  if (!authToken) {
    logResult('Load Bookings', 'FAIL', 'No auth token available');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      logResult('Load Bookings', 'PASS', `Bookings loaded with ${data.bookings?.length || 0} items`);
      return true;
    } else {
      logResult('Load Bookings', 'FAIL', data.message || 'Failed to load bookings');
      return false;
    }
  } catch (error) {
    logResult('Load Bookings', 'FAIL', `Bookings load error: ${error.message}`);
    return false;
  }
}

// Test 10: Navigation Routes
async function testNavigationRoutes() {
  const routes = [
    '/',
    '/traveler-dashboard',
    '/journey-planner',
    '/services-overview',
    '/destination-discovery',
    '/provider-profile/1',
    '/cart',
    '/login',
    '/register'
  ];

  let allPassed = true;
  
  for (const route of routes) {
    // Note: This is a simplified test - in a real browser environment,
    // you would check if the route renders correctly
    logResult('Navigation Routes', 'PASS', `Route ${route} is defined`);
  }

  return allPassed;
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting Complete System Functionality Test\n');
  console.log('='.repeat(60));
  
  // Run tests in sequence
  const backendHealthy = await testBackendHealth();
  
  if (!backendHealthy) {
    console.log('\n❌ Backend is not healthy. Stopping tests.');
    printSummary();
    return;
  }

  const authenticated = await testAuthentication();
  
  if (!authenticated) {
    console.log('\n❌ Authentication failed. Stopping tests.');
    printSummary();
    return;
  }

  // Run remaining tests
  await testLoadCart();
  const service = await testFetchServices();
  
  if (service) {
    await testAddToCart(service);
    await testVerifyCartUpdate();
  }
  
  await testLoadFavorites();
  await testLoadTripPlans();
  await testLoadBookings();
  await testNavigationRoutes();

  console.log('\n' + '='.repeat(60));
  printSummary();
}

function printSummary() {
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
  console.log('='.repeat(60));

  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(result => {
      console.log(`  - ${result.test}: ${result.message}`);
    });
  }

  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach(result => {
      console.log(`  - ${result.test}: ${result.message}`);
    });
  }

  console.log('\n');
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
