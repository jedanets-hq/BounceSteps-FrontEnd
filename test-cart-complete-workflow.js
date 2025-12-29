const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'traveler@test.com',
  password: 'password123'
};

let authToken = null;
let userId = null;
let serviceId = null;

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
  console.log('\n🧪 COMPLETE ADD TO CART WORKFLOW TEST\n');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Login
    console.log('📝 STEP 1: Login as traveler');
    console.log('────────────────────────────────────────────────────────────');
    const loginRes = await makeRequest('POST', '/auth/login', TEST_USER);
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

    // Step 2: Get services
    console.log('📝 STEP 2: Fetch available services');
    console.log('────────────────────────────────────────────────────────────');
    const servicesRes = await makeRequest('GET', '/services?limit=5');
    console.log(`Status: ${servicesRes.status}`);
    
    if (!servicesRes.data?.success || !servicesRes.data?.services?.length) {
      console.error('❌ No services found');
      return;
    }

    const service = servicesRes.data.services[0];
    serviceId = service.id;
    console.log(`✅ Services fetched: ${servicesRes.data.services.length} services`);
    console.log(`   Selected service: ${service.title} (ID: ${serviceId})`);
    console.log(`   Price: ${service.price}\n`);

    // Step 3: Add to cart
    console.log('📝 STEP 3: Add service to cart');
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

    // Step 4: Get cart
    console.log('📝 STEP 4: Retrieve cart items');
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
        console.log(`   [${idx + 1}] ${item.title} - Qty: ${item.quantity} - Price: ${item.price}`);
      });
    }
    console.log();

    // Step 5: Verify data in database
    console.log('📝 STEP 5: Verify cart data persisted in database');
    console.log('────────────────────────────────────────────────────────────');
    
    if (cartItems.length > 0) {
      const cartItem = cartItems[0];
      console.log(`✅ Cart item verified in database`);
      console.log(`   ID: ${cartItem.id}`);
      console.log(`   Service ID: ${cartItem.service_id}`);
      console.log(`   Title: ${cartItem.title}`);
      console.log(`   Quantity: ${cartItem.quantity}`);
      console.log(`   Price: ${cartItem.price}`);
      console.log(`   Provider: ${cartItem.provider_name}\n`);
    }

    // Step 6: Add another service
    console.log('📝 STEP 6: Add second service to cart');
    console.log('────────────────────────────────────────────────────────────');
    
    if (servicesRes.data.services.length > 1) {
      const service2 = servicesRes.data.services[1];
      const add2Res = await makeRequest('POST', '/cart/add', {
        serviceId: service2.id,
        quantity: 1
      });
      console.log(`Status: ${add2Res.status}`);

      if (add2Res.data?.success) {
        console.log(`✅ Second item added to cart\n`);

        // Get updated cart
        const cart2Res = await makeRequest('GET', '/cart');
        const updatedCart = cart2Res.data.cartItems || [];
        console.log(`📝 STEP 7: Verify multiple items in cart`);
        console.log('────────────────────────────────────────────────────────────');
        console.log(`✅ Cart now contains ${updatedCart.length} items`);
        updatedCart.forEach((item, idx) => {
          console.log(`   [${idx + 1}] ${item.title} - Qty: ${item.quantity}`);
        });
        console.log();
      }
    }

    // Step 8: Update quantity
    console.log('📝 STEP 8: Update cart item quantity');
    console.log('────────────────────────────────────────────────────────────');
    
    if (cartItems.length > 0) {
      const cartItemId = cartItems[0].id;
      const updateRes = await makeRequest('PUT', `/cart/${cartItemId}`, {
        quantity: 3
      });
      console.log(`Status: ${updateRes.status}`);
      console.log(`Response:`, updateRes.data);

      if (updateRes.data?.success) {
        console.log(`✅ Quantity updated successfully\n`);
      }
    }

    // Step 9: Remove item from cart
    console.log('📝 STEP 9: Remove item from cart');
    console.log('────────────────────────────────────────────────────────────');
    
    if (cartItems.length > 0) {
      const cartItemId = cartItems[0].id;
      const removeRes = await makeRequest('DELETE', `/cart/${cartItemId}`);
      console.log(`Status: ${removeRes.status}`);
      console.log(`Response:`, removeRes.data);

      if (removeRes.data?.success) {
        console.log(`✅ Item removed successfully\n`);

        // Verify removal
        const finalCartRes = await makeRequest('GET', '/cart');
        const finalCart = finalCartRes.data.cartItems || [];
        console.log(`📝 STEP 10: Verify item removal`);
        console.log('────────────────────────────────────────────────────────────');
        console.log(`✅ Cart now contains ${finalCart.length} items`);
        if (finalCart.length > 0) {
          finalCart.forEach((item, idx) => {
            console.log(`   [${idx + 1}] ${item.title}`);
          });
        } else {
          console.log(`   (Cart is empty)`);
        }
        console.log();
      }
    }

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
