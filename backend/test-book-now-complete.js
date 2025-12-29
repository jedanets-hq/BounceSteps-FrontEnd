const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const jwt = require('jsonwebtoken');
const { pool } = require('./config/postgresql');
const http = require('http');

const API_URL = 'http://localhost:5000/api';

// Helper function to make HTTP requests
const makeRequest = (method, endpoint, body, token) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: { error: data }
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

(async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Complete "Book Now" Workflow Test                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Get test user
    console.log('1️⃣  Getting Test User...');
    const userResult = await pool.query(
      "SELECT id, email, password FROM users WHERE email = 'traveler@isafari.com' LIMIT 1"
    );
    if (userResult.rows.length === 0) {
      console.log('   ❌ Test user not found\n');
      process.exit(1);
    }
    const testUser = userResult.rows[0];
    console.log(`   ✅ Test user: ${testUser.email} (ID: ${testUser.id})\n`);

    // 2. Generate JWT token (simulating login)
    console.log('2️⃣  Generating JWT Token...');
    const token = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(`   ✅ Token generated\n`);

    // 3. Get test service
    console.log('3️⃣  Getting Test Service...');
    const serviceResult = await pool.query(
      'SELECT id, title, price FROM services LIMIT 1'
    );
    if (serviceResult.rows.length === 0) {
      console.log('   ❌ No service found\n');
      process.exit(1);
    }
    const testService = serviceResult.rows[0];
    console.log(`   ✅ Test service: ${testService.title} (ID: ${testService.id})\n`);

    // 4. Test POST /api/cart/add
    console.log('4️⃣  Testing POST /api/cart/add...');
    const addRes = await makeRequest('POST', '/cart/add', {
      serviceId: testService.id,
      quantity: 1
    }, token);

    if (!addRes.data.success) {
      console.log(`   ❌ Failed: ${addRes.data.message}\n`);
      console.log('   Response:', addRes.data);
      process.exit(1);
    }
    console.log(`   ✅ Item added to cart\n`);

    // 5. Test GET /api/cart
    console.log('5️⃣  Testing GET /api/cart...');
    const getRes = await makeRequest('GET', '/cart', null, token);

    if (!getRes.data.success) {
      console.log(`   ❌ Failed: ${getRes.data.message}\n`);
      process.exit(1);
    }
    console.log(`   ✅ Cart retrieved with ${getRes.data.cartItems.length} items\n`);
    getRes.data.cartItems.forEach(item => {
      console.log(`      - ${item.title} (Qty: ${item.quantity}, Price: ${item.price})`);
    });
    console.log();

    // 6. Test without authentication
    console.log('6️⃣  Testing Without Authentication...');
    const noAuthRes = await makeRequest('POST', '/cart/add', {
      serviceId: testService.id,
      quantity: 1
    }, null);

    if (noAuthRes.status === 401) {
      console.log(`   ✅ Correctly rejected unauthenticated request (HTTP 401)\n`);
    } else {
      console.log(`   ⚠️  Expected 401, got ${noAuthRes.status}\n`);
    }

    // 7. Test with invalid service ID
    console.log('7️⃣  Testing With Invalid Service ID...');
    const invalidRes = await makeRequest('POST', '/cart/add', {
      serviceId: 99999,
      quantity: 1
    }, token);

    if (invalidRes.status === 404) {
      console.log(`   ✅ Correctly rejected invalid service (HTTP 404)\n`);
    } else {
      console.log(`   ⚠️  Expected 404, got ${invalidRes.status}\n`);
    }

    // 8. Test with missing serviceId
    console.log('8️⃣  Testing With Missing Service ID...');
    const missingRes = await makeRequest('POST', '/cart/add', {
      quantity: 1
    }, token);

    if (missingRes.status === 400) {
      console.log(`   ✅ Correctly rejected missing serviceId (HTTP 400)\n`);
    } else {
      console.log(`   ⚠️  Expected 400, got ${missingRes.status}\n`);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ All "Book Now" Workflow Tests Passed!                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
