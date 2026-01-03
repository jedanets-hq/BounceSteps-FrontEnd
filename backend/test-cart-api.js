const API_URL = 'http://localhost:5000/api';

// Test data
let testToken = '';
let testUserId = '';
let testServiceId = '';

async function testCartAPI() {
  try {
    console.log('🧪 Testing Cart API...\n');

    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@test.com`,
        password: 'Test123456!',
        firstName: 'Test',
        lastName: 'User',
        userType: 'traveler',
        phone: '255700000000'
      })
    });

    const registerData = await registerRes.json();
    if (!registerData.success) {
      console.error('❌ Registration failed:', registerData.message);
      return;
    }

    testToken = registerData.token;
    testUserId = registerData.user.id;
    console.log('✅ User registered:', testUserId);
    console.log('✅ Token:', testToken.substring(0, 20) + '...\n');

    // Step 2: Create a test service
    console.log('2️⃣ Creating test service...');
    
    // First, create a service provider
    const providerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `provider-${Date.now()}@test.com`,
        password: 'Test123456!',
        firstName: 'Provider',
        lastName: 'Test',
        userType: 'service_provider',
        phone: '255700000001',
        companyName: 'Test Company',
        businessType: 'Tours',
        serviceLocation: 'Dar es Salaam',
        serviceCategories: ['Tours']
      })
    });

    const providerData = await providerRes.json();
    if (!providerData.success) {
      console.error('❌ Provider registration failed:', providerData.message);
      return;
    }

    const providerToken = providerData.token;
    console.log('✅ Provider registered\n');

    // Create a service
    const serviceRes = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        title: 'Test Safari Tour',
        description: 'A test safari tour',
        category: 'Tours',
        price: 500,
        location: 'Dar es Salaam',
        region: 'Dar es Salaam',
        district: 'Dar es Salaam',
        duration: 8,
        maxParticipants: 10
      })
    });

    const serviceData = await serviceRes.json();
    if (!serviceData.success) {
      console.error('❌ Service creation failed:', serviceData.message);
      return;
    }

    testServiceId = serviceData.service.id;
    console.log('✅ Service created:', testServiceId, '\n');

    // Step 3: Test Add to Cart
    console.log('3️⃣ Testing Add to Cart...');
    const addRes = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        serviceId: testServiceId,
        quantity: 1
      })
    });

    const addData = await addRes.json();
    console.log('Response status:', addRes.status);
    console.log('Response:', addData);

    if (!addData.success) {
      console.error('❌ Add to cart failed:', addData.message);
      return;
    }

    console.log('✅ Item added to cart\n');

    // Step 4: Test Get Cart
    console.log('4️⃣ Testing Get Cart...');
    const getRes = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const getData = await getRes.json();
    console.log('Response status:', getRes.status);
    console.log('Response:', getData);

    if (!getData.success) {
      console.error('❌ Get cart failed:', getData.message);
      return;
    }

    console.log('✅ Cart retrieved');
    console.log('Cart items:', getData.cartItems.length, '\n');

    // Step 5: Test Update Cart Item
    if (getData.cartItems.length > 0) {
      console.log('5️⃣ Testing Update Cart Item...');
      const cartItemId = getData.cartItems[0].id;

      const updateRes = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify({
          quantity: 2
        })
      });

      const updateData = await updateRes.json();
      console.log('Response status:', updateRes.status);
      console.log('Response:', updateData);

      if (!updateData.success) {
        console.error('❌ Update cart failed:', updateData.message);
        return;
      }

      console.log('✅ Cart item updated\n');
    }

    // Step 6: Test Remove from Cart
    if (getData.cartItems.length > 0) {
      console.log('6️⃣ Testing Remove from Cart...');
      const cartItemId = getData.cartItems[0].id;

      const removeRes = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });

      const removeData = await removeRes.json();
      console.log('Response status:', removeRes.status);
      console.log('Response:', removeData);

      if (!removeData.success) {
        console.error('❌ Remove from cart failed:', removeData.message);
        return;
      }

      console.log('✅ Item removed from cart\n');
    }

    console.log('✅ All cart API tests passed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCartAPI();
