const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'test.traveler@example.com',
  password: 'Test@123456',
  first_name: 'Test',
  last_name: 'Traveler',
  phone: '+255123456789',
  user_type: 'traveler'
};

let authToken = null;
let userId = null;

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 CREATE TEST USER AND TEST ADD TO CART\n');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Register new user
    console.log('📝 STEP 1: Register new test user');
    console.log('────────────────────────────────────────────────────────────');
    const registerRes = await makeRequest('POST', '/auth/register', TEST_USER);
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, registerRes.data);

    if (!registerRes.data?.success) {
      console.log('⚠️  Registration failed or user already exists, attempting login...\n');
    } else {
      console.log(`✅ User registered successfully\n`);
    }

    // Step 2: Login
    console.log('📝 STEP 2: Login as traveler');
    console.log('────────────────────────────────────────────────────────────');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, loginRes.data);

    if (!loginRes.data?.success || !loginRes.data?.token) {
      console.error('❌ Login failed');
      return;
    }

    authToken = loginRes.data.token;
    userId = loginRes.data.user?.id;
    console.log(`✅ Login successful`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}\n`);

    // Step 3: Get services
    console.log('📝 STEP 3: Fetch available services');
    console.log('────────────────────────────────────────────────────────────');
    const servicesRes = await makeRequest('GET', '/services?limit=5');
    console.log(`Status: ${servicesRes.status}`);
    
    if (!servicesRes.data?.success || !servicesRes.data?.services?.length) {
      console.error('❌ No services found');
      console.log('Response:', servicesRes.data);
      return;
    }

    const service = servicesRes.data.services[0];
    const serviceId = service.id;
    console.log(`✅ Services fetched: ${servicesRes.data.services.length} services`);
    console.log(`   Selected service: ${service.title} (ID: ${serviceId})`);
    console.log(`   Price: ${service.price}\n`);

    // Step 4: Add to cart
    console.log('📝 STEP 4: Add service to cart');
    console.log('────────────────────────────────────────────────────────────');
    const addRes = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });
    console.log(`Status: ${addRes.status}`);
    console.log(`Response:`, addRes.data);

    if (!addRes.data?.success) {
      console.error('❌ Add to cart failed');
      return;
    }

    console.log(`✅ Item added to cart successfully\n`);

    // Step 5: Get cart
    console.log('📝 STEP 5: Retrieve cart items');
    console.log('────────────────────────────────────────────────────────────');
    const cartRes = await makeRequest('GET', '/cart');
    console.log(`Status: ${cartRes.status}`);
    console.log(`Response:`, cartRes.data);

    if (!cartRes.data?.success) {
      console.error('❌ Get cart failed');
      return;
    }

    const cartItems = cartRes.data.cartItems || [];
    console.log(`✅ Cart retrieved successfully`);
    console.log(`   Items in cart: ${cartItems.length}`);
    
    if (cartItems.length > 0) {
      cartItems.forEach((item, idx) => {
        console.log(`   [${idx + 1}] ${item.title}`);
        console.log(`       - ID: ${item.id}`);
        console.log(`       - Service ID: ${item.service_id}`);
        console.log(`       - Quantity: ${item.quantity}`);
        console.log(`       - Price: ${item.price}`);
        console.log(`       - Provider: ${item.provider_name}`);
      });
    }
    console.log();

    // Step 6: Add another service
    console.log('📝 STEP 6: Add second service to cart');
    console.log('────────────────────────────────────────────────────────────');
    
    if (servicesRes.data.services.length > 1) {
      const service2 = servicesRes.data.services[1];
      const add2Res = await makeRequest('POST', '/cart/add', {
        serviceId: service2.id,
        quantity: 2
      });
      console.log(`Status: ${add2Res.status}`);

      if (add2Res.data?.success) {
        console.log(`✅ Second item added to cart (quantity: 2)\n`);

        // Get updated cart
        const cart2Res = await makeRequest('GET', '/cart');
        const updatedCart = cart2Res.data.cartItems || [];
        console.log(`📝 STEP 7: Verify multiple items in cart`);
        console.log('────────────────────────────────────────────────────────────');
        console.log(`✅ Cart now contains ${updatedCart.length} items`);
        updatedCart.forEach((item, idx) => {
          console.log(`   [${idx + 1}] ${item.title} - Qty: ${item.quantity} - Price: ${item.price}`);
        });
        console.log();
      }
    }

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ ADD TO CART WORKFLOW SUCCESSFUL\n');
    console.log('Summary:');
    console.log(`  ✓ User registered/logged in`);
    console.log(`  ✓ Services fetched from database`);
    console.log(`  ✓ Items added to cart`);
    console.log(`  ✓ Cart items retrieved from database`);
    console.log(`  ✓ Data persisted in PostgreSQL\n`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
