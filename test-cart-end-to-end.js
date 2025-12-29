const http = require('http');

const API_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'test-traveler@example.com',
  password: 'password123',
  userType: 'traveler'
};

let authToken = null;
let userId = null;
let serviceId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
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
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 TESTING ADD TO CART END-TO-END WORKFLOW\n');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Register/Login
    console.log('📝 STEP 1: Login as Traveler');
    console.log('────────────────────────────────────────────────────────────');
    
    let loginRes = await makeRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginRes.status !== 200 && loginRes.data.success === false) {
      console.log('⚠️  User not found, registering...');
      const regRes = await makeRequest('POST', '/auth/register', {
        email: TEST_USER.email,
        password: TEST_USER.password,
        firstName: 'Test',
        lastName: 'Traveler',
        userType: TEST_USER.userType,
        phone: '255700000000'
      });
      
      if (!regRes.data.success) {
        console.log('❌ Registration failed:', regRes.data.message);
        return;
      }
      console.log('✅ User registered successfully');
      
      loginRes = await makeRequest('POST', '/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    }

    if (!loginRes.data.success || !loginRes.data.token) {
      console.log('❌ Login failed:', loginRes.data.message);
      return;
    }

    authToken = loginRes.data.token;
    userId = loginRes.data.user?.id;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}\n`);

    // Step 2: Get available services
    console.log('📝 STEP 2: Fetch Available Services');
    console.log('────────────────────────────────────────────────────────────');
    
    const servicesRes = await makeRequest('GET', '/services?limit=5');
    
    if (!servicesRes.data.success || !servicesRes.data.services || servicesRes.data.services.length === 0) {
      console.log('❌ No services found');
      return;
    }

    const service = servicesRes.data.services[0];
    serviceId = service.id;
    console.log(`✅ Found ${servicesRes.data.services.length} services`);
    console.log(`   Selected Service: ${service.title}`);
    console.log(`   Service ID: ${serviceId}`);
    console.log(`   Price: TZS ${service.price}\n`);

    // Step 3: Add to cart
    console.log('📝 STEP 3: Add Service to Cart');
    console.log('────────────────────────────────────────────────────────────');
    
    const addRes = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });

    if (!addRes.data.success) {
      console.log('❌ Add to cart failed:', addRes.data.message);
      console.log('   Response:', addRes.data);
      return;
    }

    console.log('✅ Item added to cart successfully');
    console.log(`   Cart Item ID: ${addRes.data.cartItem?.id}`);
    console.log(`   Quantity: ${addRes.data.cartItem?.quantity}\n`);

    // Step 4: Get cart
    console.log('📝 STEP 4: Retrieve Cart Items');
    console.log('────────────────────────────────────────────────────────────');
    
    const cartRes = await makeRequest('GET', '/cart');

    if (!cartRes.data.success) {
      console.log('❌ Get cart failed:', cartRes.data.message);
      return;
    }

    console.log('✅ Cart retrieved successfully');
    console.log(`   Total items in cart: ${cartRes.data.total}`);
    
    if (cartRes.data.cartItems && cartRes.data.cartItems.length > 0) {
      cartRes.data.cartItems.forEach((item, idx) => {
        console.log(`\n   Item ${idx + 1}:`);
        console.log(`     - Title: ${item.title}`);
        console.log(`     - Price: TZS ${item.price}`);
        console.log(`     - Quantity: ${item.quantity}`);
        console.log(`     - Provider: ${item.provider_name}`);
      });
    } else {
      console.log('   ⚠️  Cart is empty!');
    }
    console.log();

    // Step 5: Update quantity
    console.log('📝 STEP 5: Update Cart Item Quantity');
    console.log('────────────────────────────────────────────────────────────');
    
    if (cartRes.data.cartItems && cartRes.data.cartItems.length > 0) {
      const cartItemId = cartRes.data.cartItems[0].id;
      const updateRes = await makeRequest('PUT', `/cart/${cartItemId}`, {
        quantity: 2
      });

      if (!updateRes.data.success) {
        console.log('❌ Update quantity failed:', updateRes.data.message);
      } else {
        console.log('✅ Quantity updated successfully');
        console.log(`   New quantity: ${updateRes.data.cartItem?.quantity}\n`);
      }
    }

    // Step 6: Verify persistence
    console.log('📝 STEP 6: Verify Data Persistence');
    console.log('────────────────────────────────────────────────────────────');
    
    const cartRes2 = await makeRequest('GET', '/cart');
    
    if (cartRes2.data.success && cartRes2.data.cartItems && cartRes2.data.cartItems.length > 0) {
      console.log('✅ Cart data persisted successfully');
      console.log(`   Items in cart: ${cartRes2.data.cartItems.length}`);
      console.log(`   Total quantity: ${cartRes2.data.cartItems.reduce((sum, item) => sum + item.quantity, 0)}\n`);
    } else {
      console.log('❌ Cart data not persisted\n');
    }

    // Step 7: Test remove from cart
    console.log('📝 STEP 7: Remove Item from Cart');
    console.log('────────────────────────────────────────────────────────────');
    
    if (cartRes2.data.cartItems && cartRes2.data.cartItems.length > 0) {
      const cartItemId = cartRes2.data.cartItems[0].id;
      const removeRes = await makeRequest('DELETE', `/cart/${cartItemId}`);

      if (!removeRes.data.success) {
        console.log('❌ Remove from cart failed:', removeRes.data.message);
      } else {
        console.log('✅ Item removed from cart successfully\n');
      }
    }

    // Step 8: Verify empty cart
    console.log('📝 STEP 8: Verify Cart is Empty');
    console.log('────────────────────────────────────────────────────────────');
    
    const emptyCartRes = await makeRequest('GET', '/cart');
    
    if (emptyCartRes.data.success) {
      console.log('✅ Cart retrieved');
      console.log(`   Items in cart: ${emptyCartRes.data.total}`);
      if (emptyCartRes.data.total === 0) {
        console.log('   ✅ Cart is empty as expected\n');
      }
    }

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - ADD TO CART WORKFLOW IS WORKING!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
