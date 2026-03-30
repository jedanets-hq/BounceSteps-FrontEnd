const https = require('https');
const http = require('http');

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

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('📡 Testing Service Provider Registration...');
  console.log('URL:', `${API_URL}/auth/register`);
  console.log('Data:', JSON.stringify(userData, null, 2));

  const req = http.request(options, (res) => {
    console.log('\n📥 Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n📦 Response Data:', JSON.stringify(jsonData, null, 2));

        if (jsonData.success) {
          console.log('\n✅ Registration successful!');
        } else {
          console.log('\n❌ Registration failed:', jsonData.message);
        }
      } catch (error) {
        console.error('\n❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Request Error:', error.message);
  });

  req.write(postData);
  req.end();
}

testServiceProviderRegistration();
