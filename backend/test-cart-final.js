const https = require('https');

const testCart = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsImVtYWlsIjoidHJhdmVsZXJAdGVzdC5jb20iLCJ1c2VyVHlwZSI6InRyYXZlbGVyIiwiaWF0IjoxNzY2OTIzNTY5LCJleHAiOjE3Njc1MjgzNjl9.2P0kys1BMaBAgMramTse47AlaNYsUmGAnniu6f6M1vc';
  
  console.log('🔍 Testing Cart Endpoint with Valid Token...\n');

  console.log('1️⃣ Testing cart/add endpoint...');
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
    console.log('   Response:', JSON.stringify(cartResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Cart endpoint failed:', error.message);
  }

  console.log('\n✅ Test complete!');
};

testCart();
