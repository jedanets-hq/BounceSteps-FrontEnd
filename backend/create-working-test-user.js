const axios = require('axios');

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function createTestUser() {
  console.log('🔧 Creating test user for login testing...\n');
  
  const userData = {
    email: 'testuser@isafari.com',
    password: 'Test123456',
    firstName: 'Test',
    lastName: 'User',
    userType: 'traveler',
    phone: '+255123456789'
  };

  try {
    console.log('📝 Registering:', userData.email);
    const response = await axios.post(`${API_URL}/auth/register`, userData, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      console.log('\n✅ User created successfully!');
      console.log('\n📋 LOGIN CREDENTIALS:');
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      
      // Test login immediately
      console.log('\n🔐 Testing login...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      });
      
      console.log(`Login Status: ${loginResponse.status}`);
      if (loginResponse.status === 200) {
        console.log('✅ LOGIN WORKS!');
        console.log('Token:', loginResponse.data.token?.substring(0, 20) + '...');
      } else {
        console.log('❌ Login failed:', loginResponse.data);
      }
    } else if (response.status === 400 && response.data.message?.includes('already exists')) {
      console.log('\n⚠️  User already exists, testing login...');
      
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true
      });
      
      console.log(`Login Status: ${loginResponse.status}`);
      if (loginResponse.status === 200) {
        console.log('✅ LOGIN WORKS!');
        console.log('\n📋 USE THESE CREDENTIALS:');
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
      } else {
        console.log('❌ Login failed:', loginResponse.data);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

createTestUser();
