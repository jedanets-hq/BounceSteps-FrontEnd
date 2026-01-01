const fetch = require('node-fetch');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

(async () => {
  try {
    console.log('🔍 Testing API endpoints\n');
    console.log('API URL:', API_URL);
    
    // First, login to get a token
    console.log('\n1️⃣  Testing login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'traveler@isafari.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Success:', loginData.success);
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('   ✅ Login successful');
    console.log('   User ID:', userId);
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // Test cart endpoint
    console.log('\n2️⃣  Testing GET /cart...');
    const cartResponse = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const cartData = await cartResponse.json();
    console.log('   Status:', cartResponse.status);
    console.log('   Success:', cartData.success);
    console.log('   Cart items:', cartData.cartItems?.length || 0);
    if (cartData.cartItems && cartData.cartItems.length > 0) {
      cartData.cartItems.forEach(item => {
        console.log(`     - ${item.title} (qty: ${item.quantity})`);
      });
    }
    
    // Test bookings endpoint
    console.log('\n3️⃣  Testing GET /bookings...');
    const bookingsResponse = await fetch(`${API_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const bookingsData = await bookingsResponse.json();
    console.log('   Status:', bookingsResponse.status);
    console.log('   Success:', bookingsData.success);
    console.log('   Bookings:', bookingsData.bookings?.length || 0);
    if (bookingsData.bookings && bookingsData.bookings.length > 0) {
      bookingsData.bookings.forEach(booking => {
        console.log(`     - ${booking.service_title || 'Service'} (status: ${booking.status})`);
      });
    }
    
    // Test favorites endpoint
    console.log('\n4️⃣  Testing GET /favorites...');
    const favoritesResponse = await fetch(`${API_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const favoritesData = await favoritesResponse.json();
    console.log('   Status:', favoritesResponse.status);
    console.log('   Success:', favoritesData.success);
    console.log('   Favorites:', favoritesData.favorites?.length || 0);
    if (favoritesData.favorites && favoritesData.favorites.length > 0) {
      favoritesData.favorites.forEach(fav => {
        console.log(`     - ${fav.business_name}`);
      });
    }
    
    // Test trip plans endpoint
    console.log('\n5️⃣  Testing GET /plans...');
    const plansResponse = await fetch(`${API_URL}/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const plansData = await plansResponse.json();
    console.log('   Status:', plansResponse.status);
    console.log('   Success:', plansData.success);
    console.log('   Trip plans:', plansData.plans?.length || 0);
    if (plansData.plans && plansData.plans.length > 0) {
      plansData.plans.forEach(plan => {
        console.log(`     - ${plan.title} (date: ${plan.plan_date})`);
      });
    }
    
    console.log('\n✅ All API tests complete!');
    console.log('\n📊 SUMMARY:');
    console.log('   Cart items:', cartData.cartItems?.length || 0);
    console.log('   Bookings:', bookingsData.bookings?.length || 0);
    console.log('   Favorites:', favoritesData.favorites?.length || 0);
    console.log('   Trip plans:', plansData.plans?.length || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
})();
