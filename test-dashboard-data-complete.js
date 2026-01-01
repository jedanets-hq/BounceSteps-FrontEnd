const fetch = require('node-fetch');

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

// Test user credentials (use a real test user)
const TEST_EMAIL = 'test@traveler.com';
const TEST_PASSWORD = '123456';

async function testDashboardData() {
  console.log('🔍 TESTING DASHBOARD DATA PERSISTENCE\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('✅ Login successful');
    console.log('   User ID:', userId);
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // Step 2: Check Cart Items
    console.log('\n📦 Step 2: Checking Cart Items...');
    const cartResponse = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const cartData = await cartResponse.json();
    console.log('   Response:', cartData);
    
    if (cartData.success) {
      console.log('✅ Cart API working');
      console.log('   Items in cart:', cartData.cartItems?.length || 0);
      if (cartData.cartItems && cartData.cartItems.length > 0) {
        console.log('   Cart items:');
        cartData.cartItems.forEach((item, idx) => {
          console.log(`     ${idx + 1}. ${item.title} (ID: ${item.id}, Service ID: ${item.service_id})`);
        });
      } else {
        console.log('   ⚠️  Cart is empty');
      }
    } else {
      console.error('❌ Cart API failed:', cartData.message);
    }
    
    // Step 3: Check Bookings
    console.log('\n📅 Step 3: Checking Bookings...');
    const bookingsResponse = await fetch(`${API_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const bookingsData = await bookingsResponse.json();
    console.log('   Response:', bookingsData);
    
    if (bookingsData.success) {
      console.log('✅ Bookings API working');
      console.log('   Bookings count:', bookingsData.bookings?.length || 0);
      if (bookingsData.bookings && bookingsData.bookings.length > 0) {
        console.log('   Bookings:');
        bookingsData.bookings.forEach((booking, idx) => {
          console.log(`     ${idx + 1}. ${booking.service_title} - ${booking.status} (ID: ${booking.id})`);
        });
      } else {
        console.log('   ⚠️  No bookings found');
      }
    } else {
      console.error('❌ Bookings API failed:', bookingsData.message);
    }
    
    // Step 4: Check Favorites
    console.log('\n❤️  Step 4: Checking Favorites...');
    const favoritesResponse = await fetch(`${API_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const favoritesData = await favoritesResponse.json();
    console.log('   Response:', favoritesData);
    
    if (favoritesData.success) {
      console.log('✅ Favorites API working');
      console.log('   Favorites count:', favoritesData.favorites?.length || 0);
      if (favoritesData.favorites && favoritesData.favorites.length > 0) {
        console.log('   Favorites:');
        favoritesData.favorites.forEach((fav, idx) => {
          console.log(`     ${idx + 1}. ${fav.business_name} (Provider ID: ${fav.provider_id})`);
        });
      } else {
        console.log('   ⚠️  No favorites found');
      }
    } else {
      console.error('❌ Favorites API failed:', favoritesData.message);
    }
    
    // Step 5: Check Trip Plans
    console.log('\n🗺️  Step 5: Checking Trip Plans...');
    const plansResponse = await fetch(`${API_URL}/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const plansData = await plansResponse.json();
    console.log('   Response:', plansData);
    
    if (plansData.success) {
      console.log('✅ Plans API working');
      console.log('   Plans count:', plansData.plans?.length || 0);
      if (plansData.plans && plansData.plans.length > 0) {
        console.log('   Plans:');
        plansData.plans.forEach((plan, idx) => {
          console.log(`     ${idx + 1}. ${plan.title} (ID: ${plan.id})`);
        });
      } else {
        console.log('   ⚠️  No trip plans found');
      }
    } else {
      console.error('❌ Plans API failed:', plansData.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('Cart Items:', cartData.cartItems?.length || 0);
    console.log('Bookings:', bookingsData.bookings?.length || 0);
    console.log('Favorites:', favoritesData.favorites?.length || 0);
    console.log('Trip Plans:', plansData.plans?.length || 0);
    
    // Diagnosis
    console.log('\n🔍 DIAGNOSIS:');
    if ((cartData.cartItems?.length || 0) === 0 && 
        (bookingsData.bookings?.length || 0) === 0 && 
        (favoritesData.favorites?.length || 0) === 0 && 
        (plansData.plans?.length || 0) === 0) {
      console.log('❌ ALL DATA IS EMPTY - This confirms the issue!');
      console.log('   The problem is that data is not being saved to the database.');
      console.log('   OR data exists but is not being retrieved correctly.');
    } else {
      console.log('✅ Some data exists in the database');
      console.log('   The issue might be with how the frontend displays the data.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testDashboardData();
