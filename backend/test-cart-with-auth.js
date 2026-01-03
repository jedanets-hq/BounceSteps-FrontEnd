const https = require('https');

const testCartWithAuth = async () => {
  console.log('🔍 Testing Cart Endpoint with Authentication...\n');

  // First, login to get token
  console.log('1️⃣ Logging in to get token...');
  let token = null;
  
  try {
    const loginResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'isafarinetworkglobal-2.onrender.com',
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        });
      });
      
      req.on('error', reject);
      req.write(JSON.stringify({ 
        email: 'traveler@test.com', 
        password: 'password123' 
      }));
      req.end();
    });
    
    console.log('✅ Login response status:', loginResponse.status);
    if (loginResponse.data && loginResponse.data.token) {
      token = loginResponse.data.token;
      console.log('✅ Got token:', token.substring(0, 50) + '...');
    } else {
      console.log('❌ No token in response:', loginResponse.data);
    }
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }

  // Test cart endpoint with token
  if (token) {
    console.log('\n2️⃣ Testing cart/add endpoint with token...');
    try {
      const cartResponse = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'isafarinetworkglobal-2.onrender.com',
          path: '/api/cart/add',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
          });
        });
        
        req.on('error', reject);
        req.write(JSON.stringify({ serviceId: 1, quantity: 1 }));
        req.end();
      });
      
      console.log('✅ Cart endpoint response status:', cartResponse.status);
      console.log('   Response:', cartResponse.data);
    } catch (error) {
      console.log('❌ Cart endpoint failed:', error.message);
    }
  } else {
    console.log('\n❌ Cannot test cart endpoint - no token available');
  }

  console.log('\n✅ Test complete!');
};

testCartWithAuth();
