// Test script to debug profile update issue
const fetch = require('node-fetch');

const API_URL = 'https://isafarimasterorg.onrender.com/api';

// Test user credentials - replace with actual test user
const testUser = {
  email: 'test@example.com',
  password: 'test123'
};

async function testProfileUpdate() {
  try {
    console.log('🔐 Step 1: Login to get token...');
    
    // Login first
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Test profile update
    console.log('\n📝 Step 2: Testing profile update...');
    
    const updateData = {
      first_name: 'Test',
      last_name: 'User',
      phone: '+255123456789',
      avatar_url: null
    };
    
    console.log('Update data:', updateData);
    
    const updateResponse = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('\n📥 Update response:', updateResult);
    
    if (updateResult.success) {
      console.log('✅ Profile update successful!');
    } else {
      console.error('❌ Profile update failed:', updateResult.message);
    }
    
    // Test business profile update
    console.log('\n🏢 Step 3: Testing business profile update...');
    
    const businessData = {
      business_name: 'Test Business',
      business_type: 'Tour Operator',
      service_location: 'Dar es Salaam',
      service_categories: ['Tours & Activities', 'Transportation'],
      location_data: {
        region: 'Dar es Salaam',
        district: 'Kinondoni',
        ward: 'Mikocheni',
        street: 'Test Street'
      },
      description: 'Test business description'
    };
    
    console.log('Business data:', businessData);
    
    const businessResponse = await fetch(`${API_URL}/users/business-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(businessData)
    });
    
    const businessResult = await businessResponse.json();
    console.log('\n📥 Business update response:', businessResult);
    
    if (businessResult.success) {
      console.log('✅ Business profile update successful!');
    } else {
      console.error('❌ Business profile update failed:', businessResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testProfileUpdate();
