/**
 * Diagnose Production API Issues
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function diagnoseAPI() {
  console.log('\n🔍 DIAGNOSING PRODUCTION API\n');
  console.log('='.repeat(60));
  
  // Test 1: Health Check
  console.log('\n1. Health Check:');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 2: Try different login credentials
  console.log('\n2. Testing Login Credentials:');
  
  const testUsers = [
    { email: 'daniel@gmail.com', password: '123456' },
    { email: 'dany@gmail.com', password: '123456' },
    { email: 'juma@gmail.com', password: '123456' }
  ];

  for (const user of testUsers) {
    console.log(`\n   Testing: ${user.email}`);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      console.log('   Status:', response.status);
      
      const text = await response.text();
      console.log('   Raw Response:', text.substring(0, 200));
      
      try {
        const data = JSON.parse(text);
        console.log('   Parsed:', JSON.stringify(data, null, 2));
        
        if (data.success && data.token) {
          console.log('   ✅ LOGIN SUCCESSFUL!');
          console.log('   Token:', data.token.substring(0, 30) + '...');
          
          // Test cart endpoint with this token
          console.log('\n3. Testing Cart Endpoint with Token:');
          const cartResponse = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          console.log('   Cart Status:', cartResponse.status);
          const cartText = await cartResponse.text();
          console.log('   Cart Response:', cartText.substring(0, 200));
          
          return; // Stop after first successful login
        }
      } catch (parseError) {
        console.log('   Parse Error:', parseError.message);
      }
    } catch (error) {
      console.log('   Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
}

diagnoseAPI().catch(console.error);
