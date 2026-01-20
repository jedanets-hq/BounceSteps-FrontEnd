// Test backend connection and registration endpoint
const fetch = require('node-fetch');

const BACKEND_URL = 'https://isafarinetworkglobal-2.onrender.com';

async function testBackend() {
  console.log('🧪 Testing Backend Connection...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  console.log('\n');
  
  // Test 2: Root endpoint
  console.log('2️⃣ Testing root endpoint...');
  try {
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData);
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.message);
  }
  
  console.log('\n');
  
  // Test 3: Registration endpoint (with test data)
  console.log('3️⃣ Testing registration endpoint...');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const registrationResponse = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://isafari-tz.netlify.app'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test123456!',
        firstName: 'Test',
        lastName: 'User',
        phone: '0793123456',
        userType: 'traveler'
      })
    });
    
    const registrationData = await registrationResponse.json();
    console.log('📊 Registration response status:', registrationResponse.status);
    console.log('📊 Registration response:', registrationData);
    
    if (registrationResponse.ok) {
      console.log('✅ Registration endpoint working!');
    } else {
      console.log('⚠️ Registration returned error:', registrationData.message);
    }
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
  }
  
  console.log('\n');
  
  // Test 4: CORS preflight
  console.log('4️⃣ Testing CORS...');
  try {
    const corsResponse = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://isafari-tz.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('📊 CORS status:', corsResponse.status);
    console.log('📊 CORS headers:', {
      'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': corsResponse.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': corsResponse.headers.get('access-control-allow-headers')
    });
    
    if (corsResponse.ok || corsResponse.status === 204) {
      console.log('✅ CORS configured correctly!');
    } else {
      console.log('⚠️ CORS might have issues');
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }
}

testBackend().catch(console.error);
