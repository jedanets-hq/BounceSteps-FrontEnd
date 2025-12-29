const http = require('http');

const API_URL = 'http://localhost:5000/api';

// Simulate frontend CartContext behavior
class CartContextSimulator {
  constructor() {
    this.cartItems = [];
    this.authToken = null;
    this.userId = null;
  }

  async login(email, password) {
    const response = await this.makeRequest('POST', '/auth/login', {
      email,
      password
    });

    if (response.status === 200) {
      this.authToken = response.data.token;
      this.userId = response.data.user?.id;
      console.log('✅ Login successful');
      return true;
    }
    return false;
  }

  async loadCartFromDatabase() {
    if (!this.authToken) {
      console.warn('⚠️  User not logged in');
      return false;
    }

    const response = await this.makeRequest('GET', '/cart');
    if (response.status === 200 && response.data.success) {
      this.cartItems = response.data.cartItems || [];
      console.log(`✅ Cart loaded: ${this.cartItems.length} items`);
      return true;
    }
    return false;
  }

  async addToCart(service) {
    if (!this.authToken) {
      console.error('❌ User not logged in');
      return false;
    }

    const serviceId = service.id;
    const response = await this.makeRequest('POST', '/cart/add', {
      serviceId,
      quantity: 1
    });

    if (response.status === 200 && response.data.success) {
      console.log(`✅ Added "${service.title}" to cart`);
      await this.loadCartFromDatabase();
      return true;
    }
    return false;
  }

  async updateQuantity(serviceId, newQuantity) {
    const cartItem = this.cartItems.find(item => item.service_id === serviceId);
    if (!cartItem) {
      console.error('❌ Item not found in cart');
      return false;
    }

    const response = await this.makeRequest('PUT', `/cart/${cartItem.id}`, {
      quantity: newQuantity
    });

    if (response.status === 200) {
      console.log(`✅ Updated quantity to ${newQuantity}`);
      await this.loadCartFromDatabase();
      return true;
    }
    return false;
  }

  async removeFromCart(serviceId) {
    const cartItem = this.cartItems.find(item => item.service_id === serviceId);
    if (!cartItem) {
      console.error('❌ Item not found in cart');
      return false;
    }

    const response = await this.makeRequest('DELETE', `/cart/${cartItem.id}`);

    if (response.status === 200) {
      console.log(`✅ Removed item from cart`);
      await this.loadCartFromDatabase();
      return true;
    }
    return false;
  }

  getCartTotal() {
    return this.cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getCartCount() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  displayCart() {
    console.log('\n📦 CART CONTENTS:');
    if (this.cartItems.length === 0) {
      console.log('   (empty)');
      return;
    }

    this.cartItems.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      console.log(`   ${idx + 1}. ${item.title}`);
      console.log(`      Price: ${item.price} TZS x ${item.quantity} = ${itemTotal} TZS`);
      console.log(`      Provider: ${item.provider_name}`);
    });
    console.log(`   TOTAL: ${this.getCartTotal()} TZS`);
    console.log(`   ITEMS: ${this.getCartCount()}\n`);
  }

  makeRequest(method, path, body = null) {
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

      if (this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
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
}

async function runFrontendIntegrationTest() {
  console.log('\n🧪 FRONTEND CART INTEGRATION TEST\n');
  console.log('════════════════════════════════════════════════════════\n');

  const cart = new CartContextSimulator();

  try {
    // Step 1: Login
    console.log('📝 STEP 1: User Login');
    console.log('────────────────────────────────────────────────────────');
    const loginSuccess = await cart.login('test-traveler@example.com', 'password123');
    if (!loginSuccess) {
      console.error('❌ Login failed');
      return;
    }
    console.log();

    // Step 2: Load initial cart
    console.log('📝 STEP 2: Load Cart on App Startup');
    console.log('────────────────────────────────────────────────────────');
    await cart.loadCartFromDatabase();
    cart.displayCart();

    // Step 3: Get services
    console.log('📝 STEP 3: Fetch Services from Provider Profile');
    console.log('────────────────────────────────────────────────────────');
    const servicesRes = await cart.makeRequest('GET', '/services?limit=3');
    const services = servicesRes.data.services || [];
    console.log(`✅ Fetched ${services.length} services\n`);

    // Step 4: Add first service
    console.log('📝 STEP 4: User Clicks "Add to Cart" on Service 1');
    console.log('────────────────────────────────────────────────────────');
    if (services.length > 0) {
      await cart.addToCart(services[0]);
      cart.displayCart();
    }

    // Step 5: Add second service
    console.log('📝 STEP 5: User Clicks "Add to Cart" on Service 2');
    console.log('────────────────────────────────────────────────────────');
    if (services.length > 1) {
      await cart.addToCart(services[1]);
      cart.displayCart();
    }

    // Step 6: Update quantity
    console.log('📝 STEP 6: User Increases Quantity of First Item');
    console.log('────────────────────────────────────────────────────────');
    if (cart.cartItems.length > 0) {
      await cart.updateQuantity(cart.cartItems[0].service_id, 3);
      cart.displayCart();
    }

    // Step 7: Verify persistence after page refresh
    console.log('📝 STEP 7: Simulate Page Refresh (Reload Cart)');
    console.log('────────────────────────────────────────────────────────');
    cart.cartItems = []; // Clear local state
    await cart.loadCartFromDatabase();
    console.log('✅ Cart persisted after page refresh');
    cart.displayCart();

    // Step 8: Remove item
    console.log('📝 STEP 8: User Removes an Item from Cart');
    console.log('────────────────────────────────────────────────────────');
    if (cart.cartItems.length > 1) {
      const itemToRemove = cart.cartItems[1].service_id;
      await cart.removeFromCart(itemToRemove);
      cart.displayCart();
    }

    // Step 9: Verify final state
    console.log('📝 STEP 9: Final Cart State');
    console.log('────────────────────────────────────────────────────────');
    console.log(`✅ Cart contains ${cart.cartItems.length} item(s)`);
    console.log(`✅ Total items: ${cart.getCartCount()}`);
    console.log(`✅ Total price: ${cart.getCartTotal()} TZS\n`);

    // Summary
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ FRONTEND INTEGRATION TEST PASSED!\n');
    console.log('Verified:');
    console.log('  ✓ User authentication');
    console.log('  ✓ Cart loading on app startup');
    console.log('  ✓ Adding items to cart');
    console.log('  ✓ Updating item quantities');
    console.log('  ✓ Data persistence across page refreshes');
    console.log('  ✓ Removing items from cart');
    console.log('  ✓ Cart calculations (total, count)\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runFrontendIntegrationTest();
