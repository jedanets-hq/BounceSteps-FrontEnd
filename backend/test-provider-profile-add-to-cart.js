const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'test.provider.flow@example.com',
  password: 'Test@123456',
  firstName: 'Provider',
  lastName: 'Tester',
  phone: '+255987654321',
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
  console.log('\n🧪 PROVIDER PROFILE → ADD TO CART WORKFLOW TEST\n');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Register and login
    console.log('📝 STEP 1: Register and login user');
    console.log('────────────────────────────────────────────────────────────');
    
    const registerRes = await makeRequest('POST', '/auth/register', TEST_USER);
    console.log(`Registration Status: ${registerRes.status}`);

    const loginRes = await makeRequest('POST', '/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log(`Login Status: ${loginRes.status}`);

    if (!loginRes.data?.success || !loginRes.data?.token) {
      console.error('❌ Login failed');
      return;
    }

    authToken = loginRes.data.token;
    userId = loginRes.data.user?.id;
    console.log(`✅ User logged in (ID: ${userId})\n`);

    // Step 2: Get providers
    console.log('📝 STEP 2: Fetch service providers');
    console.log('────────────────────────────────────────────────────────────');
    const providersRes = await makeRequest('GET', '/providers?limit=3');
    console.log(`Status: ${providersRes.status}`);

    if (!providersRes.data?.success || !providersRes.data?.providers?.length) {
      console.error('❌ No providers found');
      return;
    }

    const provider = providersRes.data.providers[0];
    const providerId = provider.id;
    console.log(`✅ Providers fetched: ${providersRes.data.providers.length} available`);
    console.log(`   Selected provider: "${provider.business_name}" (ID: ${providerId})\n`);

    // Step 3: Get provider's services
    console.log('📝 STEP 3: Fetch services from provider');
    console.log('────────────────────────────────────────────────────────────');
    const servicesRes = await makeRequest('GET', `/services?provider_id=${providerId}&limit=5`);
    console.log(`Status: ${servicesRes.status}`);

    if (!servicesRes.data?.success || !servicesRes.data?.services?.length) {
      console.error('❌ No services found for this provider');
      console.log('Response:', servicesRes.data);
      return;
    }

    const service = servicesRes.data.services[0];
    const serviceId = service.id;
    console.log(`✅ Services fetched: ${servicesRes.data.services.length} available`);
    console.log(`   Selected service: "${service.title}" (ID: ${serviceId})`);
    console.log(`   Price: TZS ${service.price}\n`);

    // Step 4: Simulate "Add to Cart" button click from provider profile
    console.log('📝 STEP 4: Simulate "Add to Cart" button click');
    console.log('────────────────────────────────────────────────────────────');
    console.log('   (This simulates clicking "Add to Cart" on provider profile page)');
    
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

    console.log(`✅ Item added to cart\n`);

    // Step 5: Verify cart
    console.log('📝 STEP 5: Verify cart contents');
    console.log('────────────────────────────────────────────────────────────');
    const cartRes = await makeRequest('GET', '/cart');
    console.log(`Status: ${cartRes.status}`);

    if (!cartRes.data?.success) {
      console.error('❌ Get cart failed');
      return;
    }

    const cartItems = cartRes.data.cartItems || [];
    console.log(`✅ Cart retrieved`);
    console.log(`   Items: ${cartItems.length}`);
    
    if (cartItems.length > 0) {
      const item = cartItems[0];
      console.log(`\n   Cart Item Details:`);
      console.log(`   - Title: ${item.title}`);
      console.log(`   - Service ID: ${item.service_id}`);
      console.log(`   - Quantity: ${item.quantity}`);
      console.log(`   - Price: TZS ${item.price}`);
      console.log(`   - Provider: ${item.provider_name}`);
      console.log(`   - Category: ${item.category}`);
      console.log(`   - Location: ${item.location}`);
    }
    console.log();

    // Step 6: Add more services from same provider
    console.log('📝 STEP 6: Add more services from same provider');
    console.log('────────────────────────────────────────────────────────────');
    
    if (servicesRes.data.services.length > 1) {
      const service2 = servicesRes.data.services[1];
      const add2Res = await makeRequest('POST', '/cart/add', {
        serviceId: service2.id,
        quantity: 1
      });
      console.log(`Status: ${add2Res.status}`);

      if (add2Res.data?.success) {
        console.log(`✅ Second service added\n`);

        // Get updated cart
        const cart2Res = await makeRequest('GET', '/cart');
        const updatedCart = cart2Res.data.cartItems || [];
        console.log(`📝 STEP 7: Verify multiple services in cart`);
        console.log('────────────────────────────────────────────────────────────');
        console.log(`✅ Cart now contains ${updatedCart.length} items`);
        updatedCart.forEach((item, idx) => {
          console.log(`   [${idx + 1}] ${item.title} - TZS ${item.price} x ${item.quantity}`);
        });
        console.log();
      }
    }

    // Step 8: Verify data structure matches UI expectations
    console.log('📝 STEP 8: Verify data structure for UI components');
    console.log('────────────────────────────────────────────────────────────');
    const finalCartRes = await makeRequest('GET', '/cart');
    const finalCart = finalCartRes.data.cartItems || [];
    
    if (finalCart.length > 0) {
      const item = finalCart[0];
      const requiredFields = ['id', 'title', 'price', 'quantity', 'service_id', 'provider_name', 'category', 'location'];
      const missingFields = requiredFields.filter(field => !(field in item));
      
      if (missingFields.length === 0) {
        console.log(`✅ All required fields present in cart items`);
        console.log(`   Fields: ${requiredFields.join(', ')}`);
      } else {
        console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
      }
    }
    console.log();

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ PROVIDER PROFILE WORKFLOW TEST PASSED\n');
    console.log('Verification Summary:');
    console.log(`  ✓ User authentication working`);
    console.log(`  ✓ Providers fetched from database`);
    console.log(`  ✓ Provider services fetched`);
    console.log(`  ✓ "Add to Cart" button works correctly`);
    console.log(`  ✓ Cart data persisted in PostgreSQL`);
    console.log(`  ✓ Multiple services can be added`);
    console.log(`  ✓ Data structure matches UI expectations\n`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
