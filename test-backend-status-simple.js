/**
 * Simple Backend Status Check
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function checkBackend() {
  console.log('🔍 Checking backend status...');
  console.log(`API URL: ${API_URL}\n`);
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log(`   ✅ Backend is healthy:`, data);
    } else {
      console.log(`   ⚠️  Health check returned ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Health check failed:`, error.message);
  }
  
  try {
    // Test 2: Services endpoint (public)
    console.log('\n2. Testing services endpoint...');
    const servicesResponse = await fetch(`${API_URL}/services`);
    console.log(`   Status: ${servicesResponse.status}`);
    
    if (servicesResponse.ok) {
      const data = await servicesResponse.json();
      console.log(`   ✅ Services endpoint working`);
      console.log(`   Total services: ${data.services?.length || 0}`);
    } else {
      console.log(`   ❌ Services endpoint returned ${servicesResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Services check failed:`, error.message);
  }
  
  try {
    // Test 3: Try to register a test user
    console.log('\n3. Registering test user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.traveler@isafari.com',
        password: '123456',
        firstName: 'Test',
        lastName: 'Traveler',
        userType: 'traveler',
        phone: '+255700000999'
      })
    });
    
    console.log(`   Status: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log(`   ✅ User registered successfully`);
      console.log(`   User ID: ${registerData.user?.id}`);
      
      // Test 4: Try to login with the new user
      console.log('\n4. Testing login with new user...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test.traveler@isafari.com',
          password: '123456'
        })
      });
      
      console.log(`   Status: ${loginResponse.status}`);
      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        console.log(`   ✅ Login successful`);
        console.log(`   Token: ${loginData.token?.substring(0, 20)}...`);
        return loginData.token;
      } else {
        console.log(`   ❌ Login failed:`, loginData.message);
      }
    } else {
      console.log(`   ⚠️  Registration response:`, registerData.message);
      
      // If user already exists, try to login
      if (registerData.message?.includes('already exists')) {
        console.log('\n4. User exists, trying to login...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test.traveler@isafari.com',
            password: '123456'
          })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.success) {
          console.log(`   ✅ Login successful`);
          return loginData.token;
        } else {
          console.log(`   ❌ Login failed:`, loginData.message);
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Registration/Login failed:`, error.message);
  }
  
  return null;
}

checkBackend().then(token => {
  if (token) {
    console.log('\n✅ Backend is fully operational!');
    console.log('You can now run the full system check.');
  } else {
    console.log('\n⚠️  Backend has some issues. Please check the logs above.');
  }
}).catch(error => {
  console.error('\n💥 Fatal error:', error);
});
