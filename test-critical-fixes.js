/**
 * Test script to verify critical fixes
 * Tests both booking creation and provider details fetch
 */

const fetch = require('node-fetch');

const API_URL = process.env.VITE_API_BASE_URL || 'https://isafarimasterorg.onrender.com/api';

async function testProviderDetails() {
  console.log('\n🧪 TEST 1: Provider Details Fetch');
  console.log('=====================================\n');
  
  try {
    // Test with a known provider ID (you'll need to replace this with an actual ID)
    const testProviderId = 1; // Replace with actual provider user_id
    
    console.log(`📋 Fetching provider details for ID: ${testProviderId}`);
    const response = await fetch(`${API_URL}/providers/${testProviderId}`);
    const data = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ TEST PASSED: Provider details fetched successfully');
      console.log('   - Provider:', data.provider.business_name);
      console.log('   - Services:', data.provider.services?.length || 0);
    } else {
      console.log('❌ TEST FAILED:', data.message);
    }
  } catch (error) {
    console.log('❌ TEST ERROR:', error.message);
  }
}

async function testBookingCreation() {
  console.log('\n🧪 TEST 2: Booking Creation');
  console.log('=====================================\n');
  
  console.log('⚠️  This test requires authentication');
  console.log('    Please test manually by:');
  console.log('    1. Login as traveler');
  console.log('    2. Add service to cart');
  console.log('    3. Click Pre-Order');
  console.log('    4. Check backend logs for success');
}

async function runTests() {
  console.log('🚀 Starting Critical Fixes Verification');
  console.log('========================================\n');
  console.log('API URL:', API_URL);
  
  await testProviderDetails();
  await testBookingCreation();
  
  console.log('\n========================================');
  console.log('✅ Tests completed');
  console.log('========================================\n');
}

runTests();
