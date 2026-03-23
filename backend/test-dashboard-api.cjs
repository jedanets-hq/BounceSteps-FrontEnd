const axios = require('axios');

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API Endpoints...\n');

  const baseURL = 'http://localhost:5000/api/admin';
  
  const periods = ['today', '7days', '30days', '90days', 'alltime'];

  try {
    for (const period of periods) {
      console.log(`\n📊 Testing period: ${period.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      const response = await axios.get(`${baseURL}/dashboard/stats?period=${period}`);
      
      if (response.data.success) {
        const stats = response.data.stats;
        
        console.log('✅ API Response successful!');
        console.log('\nUsers:');
        console.log(`  Total: ${stats.users.total}`);
        console.log(`  Growth: ${stats.users.growth}%`);
        
        console.log('\nProviders:');
        console.log(`  Total: ${stats.providers.total}`);
        console.log(`  Verified: ${stats.providers.verified}`);
        console.log(`  Growth: ${stats.providers.growth}%`);
        
        console.log('\nBookings:');
        console.log(`  Total: ${stats.bookings.total}`);
        console.log(`  Completed: ${stats.bookings.completed}`);
        console.log(`  Growth: ${stats.bookings.growth}%`);
        
        console.log('\nRevenue:');
        console.log(`  Total: $${stats.revenue.total.toFixed(2)}`);
        console.log(`  Growth: ${stats.revenue.growth}%`);
      } else {
        console.log('❌ API returned unsuccessful response');
      }
    }
    
    console.log('\n\n✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDashboardAPI();
