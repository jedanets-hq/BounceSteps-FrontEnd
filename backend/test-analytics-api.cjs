const fetch = require('node-fetch');

async function testAnalyticsAPI() {
  try {
    console.log('🔍 Testing Analytics API...\n');
    
    // First, login to get token
    console.log('1️⃣ Logging in as service provider...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dantest1@gmail.com', // DANSHOP user
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('   User:', loginData.user.email);
    console.log('   Token:', loginData.token.substring(0, 20) + '...');
    
    // Test analytics endpoint
    console.log('\n2️⃣ Fetching analytics...');
    const analyticsResponse = await fetch('http://localhost:5000/api/bookings/provider-analytics?timeRange=30days', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Response status:', analyticsResponse.status);
    
    const analyticsData = await analyticsResponse.json();
    
    if (analyticsData.success) {
      console.log('✅ Analytics fetched successfully\n');
      console.log('📊 Analytics Data:');
      console.log('   Revenue:', analyticsData.analytics.revenue);
      console.log('   Bookings:', analyticsData.analytics.bookings);
      console.log('   Customers:', analyticsData.analytics.customers);
      console.log('   Rating:', analyticsData.analytics.rating);
      console.log('\n📈 Top Services:', analyticsData.topServices.length);
      analyticsData.topServices.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.name} - ${s.bookings} bookings - TZS ${s.revenue}`);
      });
      console.log('\n📅 Monthly Data:', analyticsData.monthlyData.length, 'months');
    } else {
      console.error('❌ Analytics failed:', analyticsData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAnalyticsAPI();
