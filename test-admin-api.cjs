const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API endpoints...\n');
    
    // Test dashboard stats
    console.log('1️⃣ Testing dashboard stats...');
    const statsRes = await fetch(`${API_URL}/api/admin/dashboard/stats?period=30days`);
    const statsData = await statsRes.json();
    console.log('Stats response:', JSON.stringify(statsData, null, 2));
    
    // Test users list
    console.log('\n2️⃣ Testing users list...');
    const usersRes = await fetch(`${API_URL}/api/admin/users?page=1&limit=5`);
    const usersData = await usersRes.json();
    console.log('Users count:', usersData.users?.length || 0);
    console.log('Total users:', usersData.pagination?.total || 0);
    
    // Test providers list
    console.log('\n3️⃣ Testing providers list...');
    const providersRes = await fetch(`${API_URL}/api/admin/providers?page=1&limit=5`);
    const providersData = await providersRes.json();
    console.log('Providers count:', providersData.providers?.length || 0);
    console.log('Total providers:', providersData.pagination?.total || 0);
    
    // Test activity
    console.log('\n4️⃣ Testing recent activity...');
    const activityRes = await fetch(`${API_URL}/api/admin/dashboard/activity?limit=5`);
    const activityData = await activityRes.json();
    console.log('Activities count:', activityData.activities?.length || 0);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminAPI();
