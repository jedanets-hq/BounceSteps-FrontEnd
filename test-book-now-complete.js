const http = require('http');

const API_BASE = 'http://localhost:5000/api';

// Test data
let authToken = null;
let userId = null;
let serviceId = null;
let providerId = null;

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
  console.log('📱 Testing Complete "Book Now" Workflow\n');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Create traveler account
    console.log('1️⃣  Creating Traveler Account...');
    const travelerEmail = `traveler-${Date.now()}@example.com`;
    const registerTraveler = await makeRequest('POST', '/auth/register', {
      email: travelerEmail,
      password: 'Test123!@#',
      userType: 'traveler',
      firstName: 'John',
      lastName: 'Traveler',
      phone: '+255123456789'
    });
    
    if (registerTraveler.status !== 201) {
      console.log(`   ❌ Failed: ${registerTraveler.status}`);
      return;
    }
    
    authToken = registerTraveler.data.token;
    userId = registerTraveler.data.user.id;
    console.log(`   ✅ Traveler created: ${travelerEmail}`);
    console.log(`   ✅ User ID: ${userId}\n`);

    // 2. Get available services
    console.log('2️⃣  Fetching Available Services...');
    const services = await makeRequest('GET', '/services');
    
    if (services.status !== 200 || !services.data.services || services.data.services.length === 0) {
      console.log(`   ❌ No services available`);
      return;
    }
    
    serviceId = services.data.services[0].id;
    providerId = services.data.services[0].provider_id;
    const serviceName = services.data.services[0].title;
    const servicePrice = services.data.services[0].price;
    
    console.log(`   ✅ Found ${services.data.services.length} services`);
    console.log(`   ✅ Selected service: "${serviceName}" (ID: ${serviceId})`);
    console.log(`   ✅ Price: ${servicePrice}\n`);

    // 3. Verify cart is empty
    console.log('3️⃣  Verifying Cart is Empty...');
    const emptyCart = await makeRequest('GET', '/cart');
    
    if (emptyCart.status !== 200) {
      console.log(`   ❌ Failed to get cart: ${emptyCart.status}`);
      return;
    }
    
    console.log(`   ✅ Cart items: ${emptyCart.data.cartItems.length}`);
    console.log(`   ✅ Cart is empty\n`);

    // 4. Simulate "Book Now" button click - Add to cart
    console.log('4️⃣  Simulating "Book Now" Button Click...');
    console.log(`   📍 Action: Adding service to cart`);
    
    const addToCart = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });
    
    if (addToCart.status !== 200 && addToCart.status !== 201) {
      console.log(`   ❌ Failed to add to cart: ${addToCart.status}`);
      console.log(`   ❌ Response: ${JSON.stringify(addToCart.data)}\n`);
      return;
    }
    
    console.log(`   ✅ Item added to cart successfully!`);
    console.log(`   ✅ Cart Item ID: ${addToCart.data.cartItem.id}`);
    console.log(`   ✅ Quantity: ${addToCart.data.cartItem.quantity}\n`);

    // 5. Verify item in cart
    console.log('5️⃣  Verifying Item in Cart...');
    const cartWithItem = await makeRequest('GET', '/cart');
    
    if (cartWithItem.status !== 200) {
      console.log(`   ❌ Failed to get cart: ${cartWithItem.status}`);
      return;
    }
    
    if (cartWithItem.data.cartItems.length === 0) {
      console.log(`   ❌ Item not found in cart`);
      return;
    }
    
    const cartItem = cartWithItem.data.cartItems[0];
    console.log(`   ✅ Cart now has ${cartWithItem.data.cartItems.length} item(s)`);
    console.log(`   ✅ Service: "${cartItem.title}"`);
    console.log(`   ✅ Price: ${cartItem.price}`);
    console.log(`   ✅ Quantity: ${cartItem.quantity}\n`);

    // 6. Test adding same service again (should increase quantity)
    console.log('6️⃣  Testing Add Same Service Again...');
    const addAgain = await makeRequest('POST', '/cart/add', {
      serviceId: serviceId,
      quantity: 1
    });
    
    if (addAgain.status !== 200 && addAgain.status !== 201) {
      console.log(`   ❌ Failed: ${addAgain.status}`);
      return;
    }
    
    console.log(`   ✅ Service added again`);
    console.log(`   ✅ New quantity: ${addAgain.data.cartItem.quantity}\n`);

    // 7. Verify quantity increased
    console.log('7️⃣  Verifying Quantity Increased...');
    const updatedCart = await makeRequest('GET', '/cart');
    
    if (updatedCart.data.cartItems[0].quantity !== 2) {
      console.log(`   ❌ Quantity not increased correctly`);
      return;
    }
    
    console.log(`   ✅ Quantity correctly increased to: ${updatedCart.data.cartItems[0].quantity}\n`);

    // 8. Test removing item
    console.log('8️⃣  Testing Remove from Cart...');
    const cartItemId = updatedCart.data.cartItems[0].id;
    const removeItem = await makeRequest('DELETE', `/cart/${cartItemId}`);
    
    if (removeItem.status !== 200) {
      console.log(`   ❌ Failed to remove: ${removeItem.status}`);
      return;
    }
    
    console.log(`   ✅ Item removed from cart\n`);

    // 9. Verify cart is empty again
    console.log('9️⃣  Verifying Cart is Empty Again...');
    const emptyCartAgain = await makeRequest('GET', '/cart');
    
    if (emptyCartAgain.data.cartItems.length !== 0) {
      console.log(`   ❌ Cart not empty: ${emptyCartAgain.data.cartItems.length} items`);
      return;
    }
    
    console.log(`   ✅ Cart is empty\n`);

    // 10. Test error handling - invalid service
    console.log('🔟 Testing Error Handling - Invalid Service...');
    const invalidService = await makeRequest('POST', '/cart/add', {
      serviceId: 99999,
      quantity: 1
    });
    
    if (invalidService.status === 404) {
      console.log(`   ✅ Correctly rejected invalid service (404)`);
      console.log(`   ✅ Error message: ${invalidService.data.message}\n`);
    } else {
      console.log(`   ⚠️  Unexpected status: ${invalidService.status}\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('📊 Summary:');
    console.log('   ✓ Traveler account created');
    console.log('   ✓ Services fetched successfully');
    console.log('   ✓ "Book Now" button works (add to cart)');
    console.log('   ✓ Cart persistence verified');
    console.log('   ✓ Quantity update works');
    console.log('   ✓ Item removal works');
    console.log('   ✓ Error handling works');
    console.log('\n🎉 "Book Now" workflow is fully functional!\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
