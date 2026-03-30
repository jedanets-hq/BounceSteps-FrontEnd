const fetch = require('node-fetch');

async function testServiceProviderRegistration() {
  const API_URL = 'http://localhost:5000/api';
  
  const userData = {
    email: 'testprovider@example.com',
    password: 'Test123456',
    firstName: 'Test',
    lastName: 'Provider',
    phone: '+255712345678',
    userType: 'service_provider',
    companyName: 'Test Company',
    businessType: 'Hotel/Resort',
    description: 'Test description',
    serviceLocation: 'Dar es Salaam, Tanzania',
    serviceCategories: ['Accommodation', 'Tours & Activities'],
    locationData: {
      region: 'Dar es Salaam',
      district: 'Kinondoni',
      ward: 'Mikocheni',
      street: 'Test Street'
    }
  };

  console.log('📡 Testing Service Provider Registration...');
  console.log('URL:', `${API_URL}/auth/register`);
  console.log('Data:', JSON.stringify(userData, null, 2));

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('\n📥 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\n📦 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Registration successful!');
    } else {
      console.log('\n❌ Registration failed:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testServiceProviderRegistration();
