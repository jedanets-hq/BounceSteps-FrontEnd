/**
 * Cart Functionality Test Script
 * Tests Add to Cart, Book Now, and Pre-Order functionality
 */

const API_URL = process.env.VITE_API_BASE_URL || 'https://bouncestepsmasterorg.onrender.com/api';

// Test user credentials (replace with actual test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

async function login() {
  console.log('🔐 Logging in...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });
  
  const data = await response.json();
  if (data.success && data.token) {
    console.log('✅ Login successful');
    return data.token;
  } else {
    throw new Error('Login failed: ' + data.message);
  }
}

async function testAddToCart(token, serviceId) {
  console.log('\n📦 Testing Add to Cart...');
  console.log('   Service ID:', serviceId);
  
  const response = await fetch(`${API_URL}/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      serviceId: parseInt(serviceId),
      quantity: 1
    })
  });
  
  const data = await response.json();
  console.log('   Response:', data);
  
  if (data.success) {
    console.log('✅ Add to Cart successful');
    return true;
  } else {
    console.error('❌ Add to Cart failed:', data.message);
    return false;
  }
}

async function testGetCart(token) {
  console.log('\n📋 Testing Get Cart...');
  
  const response = await fetch(`${API_URL}/cart`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('   Response:', data);
  
  if (data.success && Array.isArray(data.data)) {
    console.log('✅ Get Cart successful');
    console.log('   Cart items:', data.data.length);
    data.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (ID: ${item.id}, Service ID: ${item.service_id})`);
    });
    return data.data;
  } else {
    console.error('❌ Get Cart failed:', data.message);
    return [];
  }
}

async function testCreateBooking(token, serviceId) {
  console.log('\n🎫 Testing Create Booking (Pre-Order)...');
  console.log('   Service ID:', serviceId);
  
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      serviceId: parseInt(serviceId),
      bookingDate: new Date().toISOString().split('T')[0],
      participants: 1
    })
  });
  
  const data = await response.json();
  console.log('   Response:', data);
  
  if (data.success) {
    console.log('✅ Create Booking successful');
    return true;
  } else {
    console.error('❌ Create Booking failed:', data.message);
    return false;
  }
}

async function testClearCart(token) {
  console.log('\n🗑️  Clearing cart...');
  
  const response = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Cart cleared');
  } else {
    console.error('❌ Clear cart failed:', data.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Cart Functionality Tests');
  console.log('   Backend:', API_URL);
  console.log('');
  
  try {
    // Login
    const token = await login();
    
    // Get a service ID (you'll need to replace this with an actual service ID)
    const testServiceId = 1; // Replace with actual service ID
    
    // Test 1: Add to Cart
    const addSuccess = await testAddToCart(token, testServiceId);
    
    // Test 2: Get Cart
    const cartItems = await testGetCart(token);
    
    // Test 3: Create Booking (Pre-Order)
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      await testCreateBooking(token, firstItem.service_id);
    }
    
    // Test 4: Get Cart again to verify
    await testGetCart(token);
    
    // Cleanup: Clear cart
    await testClearCart(token);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests
runTests();
