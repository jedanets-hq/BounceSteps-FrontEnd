const https = require('https');

const createTestUser = async () => {
  console.log('🔍 Creating Test User on Render...\n');

  console.log('1️⃣ Registering test traveler...');
  
  try {
    const registerResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'isafarinetworkglobal-2.onrender.com',
        path: '/api/auth/register',
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
        password: 'password123',
        firstName: 'Test',
        lastName: 'Traveler',
        phone: '0123456789',
        userType: 'traveler'
      }));
      req.end();
    });
    
    console.log('✅ Register response status:', registerResponse.status);
    console.log('   Response:', registerResponse.data);
    
    if (registerResponse.data && registerResponse.data.token) {
      console.log('\n✅ Test user created successfully!');
      console.log('   Email: traveler@test.com');
      console.log('   Password: password123');
      console.log('   Token:', registerResponse.data.token.substring(0, 50) + '...');
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
  }

  console.log('\n✅ Done!');
};

createTestUser();
