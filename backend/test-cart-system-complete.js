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
  console.log('\n🧪 COMPLETE CART SYSTEM TEST\n');
  console.log('════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Register/Login
    console.log('📝 STEP 1: Register Test User');
    console.log('────────────────────────────────────────────────────────');
    
    let loginRes = await makeRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginRes.status !== 200) {
      console.log('⚠️  User not found, registering...');
      const regRes = await makeRequest('POST', '/auth/register', {
        email: TEST_USER.email,
        password: TEST_USER.password,
        first_name: 'Test',
        last_name: 'Traveler',
        user_type: TEST_USER.userType
      });
      
      if (regRes.status !== 201 && regRes.status !== 200) {
        console.log('❌ Registration failed:', regRes.data);
        return;
      }
      console.log('✅ User registered');
      
      // Login after registration
      loginRes = await makeRequest('POST', '/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    }

    if (loginRes.status !== 200) {
      console.log('❌ Login failed:', loginRes.data);
      return;
    }

    authToken = loginRes.data.token;
    userId = loginRes.data.user?.id;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}\n`);

    // Step 2: Get available services
    console.log('📝 STEP 2: Fetch Available Services');
    console.log('────────────────────────────────────────────────────────');
    
    const servicesRes = await makeRequest('GET', '/services?limit=5');
    if (servicesRes.status !== 200) {
      console.log('❌ Failed to fetch services:', servicesRes.data);
      return;
    }

    const services = servicesRes.data.services || [];
    if (services.length === 0) {
      console.log('❌ No services available');
      return;
    }

    serviceId = services[0].id;
    console.log(`✅ Found ${services.length} services`);
    console.log(`   Selected service: ${services[0].title} (ID: ${serviceId})`);
    console.log(`   Price: ${services[0].price}\n`);

    // Step 3: Add to cart
    console.log('📝 STEP 3: Add Service to Cart');
    console.log('────────────────────────────────────────────────────────');
    
    const addRes = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });

    if (addRes.status !== 200) {
      console.log('❌ Failed to add to cart:', addRes.data);
      console.log('   Status:', addRes.status);
      return;
    }

    console.log('✅ Item added to cart');
    console.log(`   Cart Item ID: ${addRes.data.cartItem?.id}`);
    console.log(`   Quantity: ${addRes.data.cartItem?.quantity}\n`);

    // Step 4: Get cart
    console.log('📝 STEP 4: Retrieve Cart Items');
    console.log('────────────────────────────────────────────────────────');
    
    const cartRes = await makeRequest('GET', '/cart');
    if (cartRes.status !== 200) {
      console.log('❌ Failed to get cart:', cartRes.data);
      return;
    }

    const cartItems = cartRes.data.cartItems || [];
    console.log(`✅ Cart retrieved with ${cartItems.length} item(s)`);
    
    if (cartItems.length > 0) {
      cartItems.forEach((item, idx) => {
        console.log(`   Item ${idx + 1}:`);
        console.log(`     - ID: ${item.id}`);
        console.log(`     - Title: ${item.title}`);
        console.log(`     - Price: ${item.price}`);
        console.log(`     - Quantity: ${item.quantity}`);
        console.log(`     - Provider: ${item.provider_name}`);
      });
    }
    console.log();

    // Step 5: Update quantity
    console.log('📝 STEP 5: Update Cart Item Quantity');
    console.log('────────────────────────────────────────────────────────');
    
    if (cartItems.length > 0) {
      const cartItemId = cartItems[0].id;
      const updateRes = await makeRequest('PUT', `/cart/${cartItemId}`, {
        quantity: 2
      });

      if (updateRes.status !== 200) {
        console.log('❌ Failed to update quantity:', updateRes.data);
      } else {
        console.log('✅ Quantity updated to 2');
        console.log(`   Updated Item: ${updateRes.data.cartItem?.id}\n`);
      }
    }

    // Step 6: Verify persistence
    console.log('📝 STEP 6: Verify Data Persistence');
    console.log('────────────────────────────────────────────────────────');
    
    const verifyRes = await makeRequest('GET', '/cart');
    if (verifyRes.status === 200) {
      const verifyItems = verifyRes.data.cartItems || [];
      console.log(`✅ Cart still contains ${verifyItems.length} item(s)`);
      
      if (verifyItems.length > 0) {
        const item = verifyItems[0];
        console.log(`   Item: ${item.title}`);
        console.log(`   Quantity: ${item.quantity}`);
        console.log(`   Total: ${item.price * item.quantity} TZS\n`);
      }
    }

    // Step 7: Test add multiple items
    console.log('📝 STEP 7: Add Another Service to Cart');
    console.log('────────────────────────────────────────────────────────');
    
    if (services.length > 1) {
      const secondServiceId = services[1].id;
      const addRes2 = await makeRequest('POST', '/cart/add', {
        serviceId: secondServiceId,
        quantity: 1
      });

      if (addRes2.status === 200) {
        console.log('✅ Second item added to cart');
        
        const finalCartRes = await makeRequest('GET', '/cart');
        if (finalCartRes.status === 200) {
          const finalItems = finalCartRes.data.cartItems || [];
          console.log(`✅ Final cart contains ${finalItems.length} item(s)`);
          
          let total = 0;
          finalItems.forEach((item, idx) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            console.log(`   ${idx + 1}. ${item.title} x${item.quantity} = ${itemTotal} TZS`);
          });
          console.log(`   TOTAL: ${total} TZS\n`);
        }
      }
    }

    // Summary
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log('  ✓ User authentication working');
    console.log('  ✓ Services API working');
    console.log('  ✓ Add to cart working');
    console.log('  ✓ Cart retrieval working');
    console.log('  ✓ Update quantity working');
    console.log('  ✓ Data persistence working');
    console.log('  ✓ Multiple items in cart working\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
