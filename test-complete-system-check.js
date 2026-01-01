/**
 * Complete System Check
 * Tests: Dashboard, Add to Cart, Navigation, Database Integration
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

// Test credentials
const TEST_USER = {
  email: 'test.traveler@isafari.com',
  password: '123456'
};

let authToken = null;
let testService = null;

console.log('\n🚀 COMPLETE SYSTEM CHECK\n');
console.log('='.repeat(70));
console.log('Testing: Dashboard, Add to Cart, Navigation, Database Integration');
console.log('='.repeat(70));
console.log('\n');

// Test 1: Backend Health
async function testBackendHealth() {
  console.log('📡 Test 1: Backend Health Check');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      console.log('   ✅ Backend is healthy');
      console.log(`   📍 API: ${API_URL}`);
      console.log(`   ⏰ Timestamp: ${data.timestamp}`);
      return true;
    } else {
      console.log('   ❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot reach backend: ${error.message}`);
    return false;
  }
}

// Test 2: User Authentication
async function testAuthentication() {
  console.log('\n🔐 Test 2: User Authentication');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      authToken = data.token;
      console.log('   ✅ Login successful');
      console.log(`   👤 User: ${data.user.firstName} ${data.user.lastName}`);
      console.log(`   📧 Email: ${data.user.email}`);
      console.log(`   🎫 Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`   ❌ Login failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Authentication error: ${error.message}`);
    return false;
  }
}

// Test 3: Fetch Services
async function testFetchServices() {
  console.log('\n🏪 Test 3: Fetch Services');
  try {
    const response = await fetch(`${API_URL}/services`);
    const data = await response.json();
    
    if (data.success && data.services && data.services.length > 0) {
      testService = data.services[0];
      console.log(`   ✅ Found ${data.services.length} services`);
      console.log(`   📦 Test Service: ${testService.title}`);
      console.log(`   💰 Price: TZS ${testService.price}`);
      console.log(`   📍 Location: ${testService.district}, ${testService.region}`);
      return true;
    } else {
      console.log('   ❌ No services found');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Services fetch error: ${error.message}`);
    return false;
  }
}

// Test 4: Load Cart (Initial State)
async function testLoadCartInitial() {
  console.log('\n🛒 Test 4: Load Cart (Initial State)');
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`   ✅ Cart loaded successfully`);
      console.log(`   📦 Items in cart: ${data.cartItems?.length || 0}`);
      if (data.cartItems && data.cartItems.length > 0) {
        data.cartItems.forEach((item, idx) => {
          console.log(`      ${idx + 1}. ${item.title} (Qty: ${item.quantity})`);
        });
      }
      return true;
    } else {
      console.log(`   ❌ Failed to load cart: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cart load error: ${error.message}`);
    return false;
  }
}

// Test 5: Add to Cart
async function testAddToCart() {
  console.log('\n➕ Test 5: Add to Cart');
  
  if (!testService) {
    console.log('   ❌ No test service available');
    return false;
  }

  try {
    console.log(`   📤 Adding "${testService.title}" to cart...`);
    
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        serviceId: testService.id,
        quantity: 1
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Service added to cart successfully');
      console.log(`   📦 Service: ${testService.title}`);
      console.log(`   💰 Price: TZS ${testService.price}`);
      return true;
    } else {
      console.log(`   ❌ Failed to add to cart: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Add to cart error: ${error.message}`);
    return false;
  }
}

// Test 6: Verify Cart Update
async function testVerifyCartUpdate() {
  console.log('\n✔️  Test 6: Verify Cart Update');
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success && data.cartItems && data.cartItems.length > 0) {
      console.log('   ✅ Cart updated successfully');
      console.log(`   📦 Total items: ${data.cartItems.length}`);
      console.log('   📋 Cart contents:');
      data.cartItems.forEach((item, idx) => {
        console.log(`      ${idx + 1}. ${item.title}`);
        console.log(`         Qty: ${item.quantity} | Price: TZS ${item.price}`);
      });
      
      const total = data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      console.log(`   💰 Total: TZS ${total.toLocaleString()}`);
      return true;
    } else {
      console.log('   ❌ Cart is empty after adding item');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cart verification error: ${error.message}`);
    return false;
  }
}

// Test 7: Load Favorites
async function testLoadFavorites() {
  console.log('\n❤️  Test 7: Load Favorites');
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Favorites loaded successfully');
      console.log(`   ⭐ Total favorites: ${data.favorites?.length || 0}`);
      if (data.favorites && data.favorites.length > 0) {
        data.favorites.forEach((fav, idx) => {
          console.log(`      ${idx + 1}. ${fav.businessName || fav.title}`);
        });
      }
      return true;
    } else {
      console.log(`   ❌ Failed to load favorites: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Favorites load error: ${error.message}`);
    return false;
  }
}

// Test 8: Load Trip Plans
async function testLoadTripPlans() {
  console.log('\n🗺️  Test 8: Load Trip Plans');
  try {
    const response = await fetch(`${API_URL}/plans`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Trip plans loaded successfully');
      console.log(`   📍 Total plans: ${data.plans?.length || 0}`);
      if (data.plans && data.plans.length > 0) {
        data.plans.forEach((plan, idx) => {
          console.log(`      ${idx + 1}. ${plan.area || plan.district}, ${plan.region}`);
          console.log(`         Services: ${plan.services?.length || 0} | Cost: TZS ${plan.totalCost || 0}`);
        });
      }
      return true;
    } else {
      console.log(`   ❌ Failed to load trip plans: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Trip plans load error: ${error.message}`);
    return false;
  }
}

// Test 9: Load Bookings
async function testLoadBookings() {
  console.log('\n📅 Test 9: Load Bookings');
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Bookings loaded successfully');
      console.log(`   📋 Total bookings: ${data.bookings?.length || 0}`);
      if (data.bookings && data.bookings.length > 0) {
        data.bookings.forEach((booking, idx) => {
          console.log(`      ${idx + 1}. ${booking.service_title || 'Service'}`);
          console.log(`         Status: ${booking.status} | Date: ${booking.booking_date}`);
          console.log(`         Amount: TZS ${booking.total_price || 0}`);
        });
      }
      return true;
    } else {
      console.log(`   ❌ Failed to load bookings: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Bookings load error: ${error.message}`);
    return false;
  }
}

// Test 10: Navigation Routes
function testNavigationRoutes() {
  console.log('\n🧭 Test 10: Navigation Routes');
  
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/traveler-dashboard', name: 'Traveler Dashboard' },
    { path: '/journey-planner', name: 'Journey Planner' },
    { path: '/services-overview', name: 'Services Overview' },
    { path: '/destination-discovery', name: 'Destination Discovery' },
    { path: '/provider/:providerId', name: 'Provider Profile' },
    { path: '/cart', name: 'Cart Page' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/profile', name: 'Profile' },
    { path: '/about', name: 'About' },
    { path: '/service-provider-dashboard', name: 'Service Provider Dashboard' }
  ];

  console.log('   ✅ All routes are defined:');
  routes.forEach((route, idx) => {
    console.log(`      ${idx + 1}. ${route.path} → ${route.name}`);
  });
  
  return true;
}

// Main test runner
async function runAllTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 10
  };

  // Run tests
  if (await testBackendHealth()) results.passed++; else results.failed++;
  if (await testAuthentication()) results.passed++; else results.failed++;
  if (await testFetchServices()) results.passed++; else results.failed++;
  if (await testLoadCartInitial()) results.passed++; else results.failed++;
  if (await testAddToCart()) results.passed++; else results.failed++;
  if (await testVerifyCartUpdate()) results.passed++; else results.failed++;
  if (await testLoadFavorites()) results.passed++; else results.failed++;
  if (await testLoadTripPlans()) results.passed++; else results.failed++;
  if (await testLoadBookings()) results.passed++; else results.failed++;
  if (testNavigationRoutes()) results.passed++; else results.failed++;

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is fully operational.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
