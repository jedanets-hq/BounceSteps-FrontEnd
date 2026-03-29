/**
 * Test service creation after adding services table
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testServiceCreation() {
  try {
    console.log('🧪 Testing service creation...\n');
    
    // Step 1: Try to login, if fails then register
    console.log('1️⃣ Attempting to login as service provider...');
    let token;
    
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'provider@test.com',
        password: 'Test123!'
      });
      
      if (loginResponse.data.success) {
        token = loginResponse.data.token;
        console.log('✅ Logged in successfully');
      }
    } catch (loginError) {
      console.log('❌ Login failed. Creating test provider account...');
      
      // Register new provider
      try {
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
          email: 'provider@test.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'Provider',
          userType: 'service_provider',
          companyName: 'Test Safari Company',
          businessType: 'Tour Operator',
          description: 'Test safari company for testing',
          serviceLocation: 'Dar es Salaam, Tanzania',
          locationData: {
            country: 'Tanzania',
            region: 'Dar es Salaam',
            district: 'Kinondoni',
            ward: 'Mikocheni',
            street: 'Mikocheni A',
            area: 'Mikocheni'
          },
          serviceCategories: ['accommodation', 'transportation']
        });
        
        if (!registerResponse.data.success) {
          console.error('❌ Registration failed:', registerResponse.data.message);
          return;
        }
        
        console.log('✅ Provider account created');
        
        // Login after registration
        const loginRetry = await axios.post(`${API_URL}/auth/login`, {
          email: 'provider@test.com',
          password: 'Test123!'
        });
        
        if (!loginRetry.data.success) {
          console.error('❌ Login failed after registration');
          return;
        }
        
        token = loginRetry.data.token;
      } catch (registerError) {
        console.error('❌ Registration error:', registerError.response?.data || registerError.message);
        return;
      }
    }
    
    console.log('✅ Logged in successfully\n');
    
    // Step 2: Create a test service
    console.log('2️⃣ Creating test service...');
    const serviceData = {
      title: 'Luxury Safari Lodge',
      description: 'Beautiful safari lodge with amazing views',
      category: 'accommodation',
      price: 150000,
      duration: '1 night',
      maxParticipants: 4,
      images: ['https://example.com/image1.jpg'],
      amenities: ['WiFi', 'Pool', 'Restaurant'],
      paymentMethods: {
        mpesa: { enabled: true },
        card: { enabled: true }
      },
      contactInfo: {
        email: { enabled: true, value: 'provider@test.com' },
        whatsapp: { enabled: true, value: '+255123456789' }
      }
    };
    
    const createResponse = await axios.post(
      `${API_URL}/services`,
      serviceData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (createResponse.data.success) {
      console.log('✅ Service created successfully!');
      console.log('📦 Service ID:', createResponse.data.service.id);
      console.log('📍 Location:', createResponse.data.service.region, '-', createResponse.data.service.district, '-', createResponse.data.service.area);
      console.log('\n✅ TEST PASSED - Service creation is working!\n');
    } else {
      console.error('❌ Service creation failed:', createResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testServiceCreation();
