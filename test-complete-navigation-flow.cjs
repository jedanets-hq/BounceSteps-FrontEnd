/**
 * Comprehensive test for provider profile navigation
 * Tests the complete flow from service card to provider profile
 */

const fetch = require('node-fetch');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function testCompleteNavigationFlow() {
  console.log('🧪 Testing Complete Provider Profile Navigation Flow\n');
  console.log('=' .repeat(70));
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Test 1: Fetch services from different endpoints
    console.log('\n📋 Test 1: Fetching services from multiple endpoints...');
    
    const endpoints = [
      '/services?limit=10',
      '/services?category=Transportation',
      '/services?is_featured=true'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_URL}${endpoint}`);
        const data = await response.json();
        
        if (data.success && data.services && data.services.length > 0) {
          console.log(`   ✅ ${endpoint}: Found ${data.services.length} services`);
          testsPassed++;
        } else {
          console.log(`   ⚠️  ${endpoint}: No services found`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: Error - ${error.message}`);
        testsFailed++;
      }
    }
    
    // Test 2: Get a service with provider_id
    console.log('\n📋 Test 2: Finding service with provider_id...');
    const servicesResponse = await fetch(`${API_URL}/services?limit=20`);
    const servicesData = await servicesResponse.json();
    
    const serviceWithProvider = servicesData.services.find(s => s.provider_id);
    
    if (!serviceWithProvider) {
      console.log('   ❌ No service with provider_id found');
      testsFailed++;
      return;
    }
    
    console.log('   ✅ Found service with provider:');
    console.log(`      - Title: ${serviceWithProvider.title}`);
    console.log(`      - Provider ID: ${serviceWithProvider.provider_id}`);
    console.log(`      - Business Name: ${serviceWithProvider.business_name || 'N/A'}`);
    testsPassed++;
    
    // Test 3: Fetch provider profile using provider_id
    console.log('\n📋 Test 3: Fetching provider profile...');
    const providerId = serviceWithProvider.provider_id;
    const providerResponse = await fetch(`${API_URL}/providers/${providerId}`);
    const providerData = await providerResponse.json();
    
    if (!providerData.success) {
      console.log(`   ❌ Failed to fetch provider: ${providerData.message}`);
      testsFailed++;
      return;
    }
    
    console.log('   ✅ Provider profile fetched successfully:');
    console.log(`      - Business Name: ${providerData.provider.business_name}`);
    console.log(`      - Location: ${providerData.provider.location || 'N/A'}`);
    console.log(`      - Verified: ${providerData.provider.is_verified ? 'Yes' : 'No'}`);
    console.log(`      - Services Count: ${providerData.provider.services_count || 0}`);
    testsPassed++;
    
    // Test 4: Verify provider has services
    console.log('\n📋 Test 4: Verifying provider services...');
    if (providerData.provider.services && providerData.provider.services.length > 0) {
      console.log(`   ✅ Provider has ${providerData.provider.services.length} services:`);
      providerData.provider.services.forEach((service, index) => {
        console.log(`      ${index + 1}. ${service.title} - TZS ${service.price}`);
      });
      testsPassed++;
    } else {
      console.log('   ⚠️  Provider has no services');
    }
    
    // Test 5: Verify service data completeness
    console.log('\n📋 Test 5: Verifying service data completeness...');
    const firstService = providerData.provider.services[0];
    const requiredFields = ['id', 'title', 'category', 'price', 'location'];
    const missingFields = requiredFields.filter(field => !firstService[field]);
    
    if (missingFields.length === 0) {
      console.log('   ✅ All required service fields present');
      testsPassed++;
    } else {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
      testsFailed++;
    }
    
    // Test 6: Test multiple providers
    console.log('\n📋 Test 6: Testing multiple provider profiles...');
    const uniqueProviderIds = [...new Set(servicesData.services.map(s => s.provider_id).filter(Boolean))];
    console.log(`   Found ${uniqueProviderIds.length} unique providers`);
    
    let providersFound = 0;
    for (const pid of uniqueProviderIds.slice(0, 3)) {
      try {
        const response = await fetch(`${API_URL}/providers/${pid}`);
        const data = await response.json();
        if (data.success) {
          providersFound++;
          console.log(`   ✅ Provider ${pid}: ${data.provider.business_name}`);
        }
      } catch (error) {
        console.log(`   ❌ Provider ${pid}: Error`);
      }
    }
    
    if (providersFound > 0) {
      console.log(`   ✅ Successfully fetched ${providersFound} provider profiles`);
      testsPassed++;
    } else {
      console.log('   ❌ Failed to fetch any provider profiles');
      testsFailed++;
    }
    
    // Test 7: Test cache-busting
    console.log('\n📋 Test 7: Testing cache-busting...');
    const timestamp1 = new Date().getTime();
    const response1 = await fetch(`${API_URL}/providers/${providerId}?_t=${timestamp1}`);
    const data1 = await response1.json();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const timestamp2 = new Date().getTime();
    const response2 = await fetch(`${API_URL}/providers/${providerId}?_t=${timestamp2}`);
    const data2 = await response2.json();
    
    if (data1.success && data2.success) {
      console.log('   ✅ Cache-busting working (different timestamps)');
      testsPassed++;
    } else {
      console.log('   ❌ Cache-busting test failed');
      testsFailed++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    
    if (testsFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Provider profile navigation is working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the comprehensive test
testCompleteNavigationFlow();
