const https = require('https');

const testBackend = async () => {
  console.log('🔍 Testing Render Backend Status...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health check endpoint...');
  try {
    const response = await new Promise((resolve, reject) => {
      https.get('https://isafarinetworkglobal-2.onrender.com/api/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        });
      }).on('error', reject);
    });
    
    console.log('✅ Health check response:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Cart endpoint (unauthenticated)
  console.log('\n2️⃣ Testing cart endpoint (unauthenticated)...');
  try {
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'isafarinetworkglobal-2.onrender.com',
        path: '/api/cart/add',
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
      req.write(JSON.stringify({ serviceId: 1, quantity: 1 }));
      req.end();
    });
    
    console.log('✅ Cart endpoint response:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Cart endpoint failed:', error.message);
  }

  // Test 3: Booking endpoint (unauthenticated)
  console.log('\n3️⃣ Testing booking endpoint (unauthenticated)...');
  try {
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'isafarinetworkglobal-2.onrender.com',
        path: '/api/bookings',
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
      req.write(JSON.stringify({ serviceId: 1, bookingDate: '2025-01-01' }));
      req.end();
    });
    
    console.log('✅ Booking endpoint response:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Booking endpoint failed:', error.message);
  }

  console.log('\n✅ Test complete!');
};

testBackend();
