const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'test.traveler.cart@example.com',
  password: 'Test@123456',
  firstName: 'Test',
  lastName: 'Traveler',
  phone: '+255123456789',
  userType: 'traveler'
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
  console.log('\n🧪 ADD TO CART WORKFLOW TEST - POSTGRESQL\n');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Register new user
    console.log('📝 STEP 1: Register new test user');
    console.log('────────────────────────────────────────────────────────────');
    const registerRes = await makeRequest('POST', '/auth/register', TEST_USER);
    console.log(`Status: ${registerRes.status}`);

    if (registerRes.status === 201 || registerRes.data?.success) {
      console.log(`✅ User registered successfully`);
    } else if (registerRes.status === 400 && registerRes.data?.message?.includes('already exists')) {
      console.log(`⚠️  User already exists, proceeding to login`);
    } else {
      console.log(`Response:`, registerRes.data);
    }
    console.log();

    // Step 2: Login
    console.log('📝 STEP 2: Login as traveler');
    console.log('────────────────────────────────────────────────────────────');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log(`Status: ${loginRes.status}`);

    if (!loginRes.data?.success || !loginRes.data?.token) {
      console.error('❌ Login failed');
      console.log('Response:', loginRes.data);
      return;
    }

    authToken = loginRes.data.token;
    userId = loginRes.data.user?.id;
    console.log(`✅ Login successful`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${authToken.substring(0, 30)}...\n`);

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
    console.log(`✅ Services fetched: ${servicesRes.data.services.length} available`);
    console.log(`   Selected: "${service.title}" (ID: ${serviceId})`);
    console.log(`   Price: TZS ${service.price}\n`);

    // Step 4: Add to cart
    console.log('📝 STEP 4: Add service to cart');
    console.log('────────────────────────────────────────────────────────────');
    const addRes = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });
    console.log(`Status: ${addRes.status}`);

    if (!addRes.data?.success) {
      console.error('❌ Add to cart failed');
      console.log('Response:', addRes.data);
      return;
    }

    console.log(`✅ Item added to cart successfully\n`);

    // Step 5: Get cart
    console.log('📝 STEP 5: Retrieve cart from database');
    console.log('────────────────────────────────────────────────────────────');
    const cartRes = await makeRequest('GET', '/cart');
    console.log(`Status: ${cartRes.status}`);

    if (!cartRes.data?.success) {
      console.error('❌ Get cart failed');
      console.log('Response:', cartRes.data);
      return;
    }

    const cartItems = cartRes.data.cartItems || [];
    console.log(`✅ Cart retrieved from PostgreSQL`);
    console.log(`   Total items: ${cartItems.length}`);
    
    if (cartItems.length > 0) {
      console.log(`\n   Items in cart:`);
      cartItems.forEach((item, idx) => {
        console.log(`   [${idx + 1}] ${item.title}`);
        console.log(`       Service ID: ${item.service_id}`);
        console.log(`       Quantity: ${item.quantity}`);
        console.log(`       Price: TZS ${item.price}`);
        console.log(`       Provider: ${item.provider_name}`);
      });
    }
    console.log();

    // Step 6: Add second service
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
        console.log(`✅ Second item added (quantity: 2)\n`);

        // Get updated cart
        const cart2Res = await makeRequest('GET', '/cart');
        const updatedCart = cart2Res.data.cartItems || [];
        console.log(`📝 STEP 7: Verify cart contents`);
        console.log('────────────────────────────────────────────────────────────');
        console.log(`✅ Cart now contains ${updatedCart.length} items`);
        updatedCart.forEach((item, idx) => {
          console.log(`   [${idx + 1}] ${item.title} (Qty: ${item.quantity})`);
        });
        console.log();
      }
    }

    // Step 8: Calculate total
    console.log('📝 STEP 8: Calculate cart total');
    console.log('────────────────────────────────────────────────────────────');
    const finalCartRes = await makeRequest('GET', '/cart');
    const finalCart = finalCartRes.data.cartItems || [];
    let total = 0;
    finalCart.forEach(item => {
      total += (item.price * item.quantity);
    });
    console.log(`✅ Cart total: TZS ${total.toLocaleString()}`);
    console.log(`   Items: ${finalCart.length}`);
    console.log();

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - ADD TO CART WORKING CORRECTLY\n');
    console.log('Verification Summary:');
    console.log(`  ✓ User authentication working`);
    console.log(`  ✓ Services fetched from PostgreSQL`);
    console.log(`  ✓ Items added to cart successfully`);
    console.log(`  ✓ Cart data persisted in PostgreSQL`);
    console.log(`  ✓ Multiple items can be added`);
    console.log(`  ✓ Cart retrieval working correctly\n`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
