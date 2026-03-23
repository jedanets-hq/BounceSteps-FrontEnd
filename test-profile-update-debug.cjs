const fetch = require('node-fetch');

const API_URL = 'https://isafarimasterorg.onrender.com/api';

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update...\n');
  
  // Step 1: Login first to get token
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'joctanelvin@gmail.com',
      password: 'Joctan@2025'
    })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login response:', loginData.success ? '✅ Success' : '❌ Failed');
  
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData.message);
    return;
  }
  
  const token = loginData.token;
  const userId = loginData.user.id;
  console.log('✅ Logged in as:', loginData.user.email, '(ID:', userId, ')');
  console.log('Token:', token.substring(0, 20) + '...\n');
  
  // Step 2: Test user profile update
  console.log('Step 2: Testing user profile update...');
  const userUpdateData = {
    first_name: 'Joctan',
    last_name: 'Elvin',
    phone: '+255123456789',
    avatar_url: null
  };
  
  console.log('Sending data:', userUpdateData);
  
  const userUpdateResponse = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userUpdateData)
  });
  
  const userUpdateResult = await userUpdateResponse.json();
  console.log('\nUser update response:', userUpdateResult);
  
  if (!userUpdateResult.success) {
    console.error('❌ User update failed:', userUpdateResult.message);
    console.error('Full response:', JSON.stringify(userUpdateResult, null, 2));
    return;
  }
  
  console.log('✅ User profile updated successfully\n');
  
  // Step 3: Test business profile update
  console.log('Step 3: Testing business profile update...');
  const businessUpdateData = {
    business_name: 'Test Business',
    business_type: 'Tour Operator',
    service_location: 'Dar es Salaam, Tanzania',
    service_categories: ['Tours & Activities', 'Transportation'],
    location_data: {
      region: 'Dar es Salaam',
      district: 'Kinondoni',
      ward: 'Mikocheni',
      street: 'Test Street'
    },
    description: 'This is a test business description'
  };
  
  console.log('Sending data:', businessUpdateData);
  
  const businessUpdateResponse = await fetch(`${API_URL}/users/business-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(businessUpdateData)
  });
  
  const businessUpdateResult = await businessUpdateResponse.json();
  console.log('\nBusiness update response:', businessUpdateResult);
  
  if (!businessUpdateResult.success) {
    console.error('❌ Business update failed:', businessUpdateResult.message);
    console.error('Full response:', JSON.stringify(businessUpdateResult, null, 2));
    return;
  }
  
  console.log('✅ Business profile updated successfully\n');
  
  // Step 4: Verify updates by fetching profile
  console.log('Step 4: Verifying updates...');
  const profileResponse = await fetch(`${API_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const profileData = await profileResponse.json();
  console.log('\nProfile data:', JSON.stringify(profileData, null, 2));
  
  console.log('\n✅ All tests completed successfully!');
}

testProfileUpdate().catch(error => {
  console.error('❌ Test failed with error:', error);
});
