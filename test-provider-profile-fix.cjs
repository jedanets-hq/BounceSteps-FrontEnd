/**
 * Test script to verify provider profile navigation fix
 * 
 * This tests:
 * 1. Fetching services with provider_id
 * 2. Using that provider_id to fetch provider profile
 * 3. Verifying provider data is returned correctly
 */

const fetch = require('node-fetch');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function testProviderProfileFix() {
  console.log('🧪 Testing Provider Profile Navigation Fix\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Fetch services to get a provider_id
    console.log('\n📡 Step 1: Fetching services...');
    const servicesResponse = await fetch(`${API_URL}/services?limit=10`);
    const servicesData = await servicesResponse.json();
    
    if (!servicesData.success || !servicesData.services || servicesData.services.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    console.log(`✅ Found ${servicesData.services.length} services`);
    
    // Find a service with a provider_id
    const serviceWithProvider = servicesData.services.find(s => s.provider_id);
    
    if (!serviceWithProvider) {
      console.log('❌ No service with provider_id found');
      return;
    }
    
    console.log('\n📋 Service Details:');
    console.log(`   Title: ${serviceWithProvider.title}`);
    console.log(`   Provider ID: ${serviceWithProvider.provider_id}`);
    console.log(`   Business Name: ${serviceWithProvider.business_name || 'N/A'}`);
    
    // Step 2: Use provider_id to fetch provider profile
    const providerId = serviceWithProvider.provider_id;
    console.log(`\n📡 Step 2: Fetching provider profile for ID: ${providerId}...`);
    
    const providerResponse = await fetch(`${API_URL}/providers/${providerId}`);
    const providerData = await providerResponse.json();
    
    console.log('\n📊 Provider API Response:');
    console.log(`   Status: ${providerResponse.status}`);
    console.log(`   Success: ${providerData.success}`);
    
    if (!providerData.success) {
      console.log(`   ❌ Error: ${providerData.message}`);
      console.log('\n🔍 Debugging Info:');
      console.log(`   - Service provider_id: ${providerId}`);
      console.log(`   - This should match users.id in the database`);
      console.log(`   - Backend should query: WHERE sp.user_id = ${providerId}`);
      return;
    }
    
    console.log('\n✅ Provider Profile Found!');
    console.log(`   Business Name: ${providerData.provider.business_name}`);
    console.log(`   Location: ${providerData.provider.location || 'N/A'}`);
    console.log(`   Verified: ${providerData.provider.is_verified ? 'Yes' : 'No'}`);
    console.log(`   Services Count: ${providerData.provider.services_count || 0}`);
    
    if (providerData.provider.services && providerData.provider.services.length > 0) {
      console.log('\n📦 Provider Services:');
      providerData.provider.services.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title} - TZS ${service.price}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST PASSED: Provider profile navigation is working!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testProviderProfileFix();
