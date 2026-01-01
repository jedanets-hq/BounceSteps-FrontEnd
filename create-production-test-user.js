/**
 * Create Test User in Production Database
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function createTestUser() {
  console.log('\n🔧 CREATING TEST USER IN PRODUCTION\n');
  console.log('='.repeat(60));
  
  const testUser = {
    firstName: 'Test',
    lastName: 'Traveler',
    email: 'test.traveler@isafari.com',
    password: '123456',
    userType: 'traveler'
  };

  console.log('\n📝 Registering user:');
  console.log('   Email:', testUser.email);
  console.log('   Name:', testUser.firstName, testUser.lastName);
  console.log('   Type:', testUser.userType);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    console.log('\n📡 Response:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);
    
    if (data.success) {
      console.log('\n✅ USER CREATED SUCCESSFULLY!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: test.traveler@isafari.com');
      console.log('   Password: 123456');
      
      // Test login
      console.log('\n🔐 Testing login...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginData.success && loginData.token) {
        console.log('   ✅ Login successful!');
        console.log('   Token:', loginData.token.substring(0, 30) + '...');
        
        // Save credentials to file
        const fs = require('fs');
        const credentials = `
TEST USER CREDENTIALS
=====================

Email: test.traveler@isafari.com
Password: 123456
User Type: Traveler

Token: ${loginData.token}

Created: ${new Date().toISOString()}
`;
        fs.writeFileSync('TEST-USER-CREDENTIALS.txt', credentials);
        console.log('\n💾 Credentials saved to TEST-USER-CREDENTIALS.txt');
      } else {
        console.log('   ❌ Login failed:', loginData.message);
      }
    } else {
      if (data.message && data.message.includes('already exists')) {
        console.log('\n⚠️  User already exists. Testing login...');
        
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });

        const loginData = await loginResponse.json();
        
        if (loginData.success && loginData.token) {
          console.log('   ✅ Login successful!');
          console.log('   Token:', loginData.token.substring(0, 30) + '...');
        } else {
          console.log('   ❌ Login failed:', loginData.message);
        }
      } else {
        console.log('\n❌ FAILED TO CREATE USER');
      }
    }
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

createTestUser().catch(console.error);
