const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test data
let authToken = null;
let userId = null;
let serviceId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    // Ensure path starts with /api if not already
    if (!path.startsWith('/api')) {
      path = '/api' + path;
    }
    
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Cart API Workflow\n');

  try {
    // 1. Test health endpoint
    console.log('1️⃣  Testing Health Endpoint...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);

    // 2. Create test user (register)
    console.log('2️⃣  Creating Test User...');
    const registerData = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#',
      userType: 'traveler',
      firstName: 'Test',
      lastName: 'User',
      phone: '+255123456789'
    };
    const register = await makeRequest('POST', '/auth/register', registerData);
    console.log(`   Status: ${register.status}`);
    console.log(`   Response: ${JSON.stringify(register.data, null, 2)}\n`);

    if (register.status !== 201 && register.status !== 200) {
      console.log('❌ Registration failed. Trying login with existing user...\n');
      
      // Try login with demo user
      const loginData = {
        email: 'traveler@example.com',
        password: 'password123'
      };
      const login = await makeRequest('POST', '/auth/login', loginData);
      console.log(`   Login Status: ${login.status}`);
      console.log(`   Login Response: ${JSON.stringify(login.data, null, 2)}\n`);
      
      if (login.data && login.data.token) {
        authToken = login.data.token;
        userId = login.data.user?.id;
      }
    } else if (register.data && register.data.token) {
      authToken = register.data.token;
      userId = register.data.user?.id;
    }

    if (!authToken) {
      console.log('❌ Could not get authentication token\n');
      return;
    }

    console.log(`✅ Got auth token: ${authToken.substring(0, 20)}...\n`);

    // 3. Get services
    console.log('3️⃣  Fetching Services...');
    const services = await makeRequest('GET', '/services');
    console.log(`   Status: ${services.status}`);
    if (services.data && services.data.services && services.data.services.length > 0) {
      serviceId = services.data.services[0].id;
      console.log(`   Found ${services.data.services.length} services`);
      console.log(`   Using service ID: ${serviceId}\n`);
    } else {
      console.log('   No services found\n');
      return;
    }

    // 4. Test Cart GET (should be empty)
    console.log('4️⃣  Getting Cart (should be empty)...');
    const cartGet = await makeRequest('GET', '/cart');
    console.log(`   Status: ${cartGet.status}`);
    console.log(`   Response: ${JSON.stringify(cartGet.data, null, 2)}\n`);

    // 5. Add item to cart
    console.log('5️⃣  Adding Item to Cart...');
    const addToCart = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });
    console.log(`   Status: ${addToCart.status}`);
    console.log(`   Response: ${JSON.stringify(addToCart.data, null, 2)}\n`);

    if (addToCart.status === 200 || addToCart.status === 201) {
      console.log('✅ Item added to cart successfully!\n');
    } else {
      console.log('❌ Failed to add item to cart\n');
    }

    // 6. Get cart again (should have item)
    console.log('6️⃣  Getting Cart (should have item)...');
    const cartGet2 = await makeRequest('GET', '/cart');
    console.log(`   Status: ${cartGet2.status}`);
    console.log(`   Response: ${JSON.stringify(cartGet2.data, null, 2)}\n`);

    // 7. Test without auth token
    console.log('7️⃣  Testing Cart Without Auth Token...');
    authToken = null;
    const noAuth = await makeRequest('GET', '/cart');
    console.log(`   Status: ${noAuth.status}`);
    console.log(`   Response: ${JSON.stringify(noAuth.data, null, 2)}\n`);

    if (noAuth.status === 401) {
      console.log('✅ Correctly rejected unauthenticated request\n');
    }

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
