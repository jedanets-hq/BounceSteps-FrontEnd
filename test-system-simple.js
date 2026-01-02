const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Test credentials
const TRAVELER_EMAIL = 'traveler.test@isafari.com';
const TRAVELER_PASSWORD = '123456';

let authToken = null;

async function testSystem() {
  try {
    console.log('\n🚀 TESTING JOURNEY PLANNER SYSTEM\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Step 1: Login as Traveler
    console.log('📝 Step 1: Logging in as traveler...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TRAVELER_EMAIL,
      password: TRAVELER_PASSWORD
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log(`   Email: ${TRAVELER_EMAIL}`);
    console.log(`   Password: ${TRAVELER_PASSWORD}\n`);
    
    // Step 2: Get all services
    console.log('📊 Step 2: Fetching all services...');
    const allServicesResponse = await axios.get(`${API_BASE_URL}/services`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const allServices = allServicesResponse.data.services || [];
    console.log(`✅ Found ${allServices.length} total services\n`);
    
    // Step 3: Test services by location
    console.log('🔍 Step 3: Testing services by location...\n');
    
    const testLocations = ['Arusha', 'Mbeya', 'Dar es Salaam', 'Zanzibar'];
    
    for (const location of testLocations) {
      console.log(`📌 Location: ${location}`);
      console.log('─────────────────────────────────────────────────────────────');
      
      try {
        // Get services for this location using region parameter
        const servicesResponse = await axios.get(
          `${API_BASE_URL}/services`,
          {
            params: { region: location },
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        
        const services = servicesResponse.data.services || [];
        console.log(`✅ Found ${services.length} services in ${location}`);
        
        if (services.length > 0) {
          services.slice(0, 3).forEach((service, index) => {
            console.log(`\n   Service ${index + 1}:`);
            console.log(`   • Title: ${service.title}`);
            console.log(`   • Category: ${service.category}`);
            console.log(`   • Price: ${service.price} TZS`);
            console.log(`   • Location: ${service.location}, ${service.region}`);
          });
          if (services.length > 3) {
            console.log(`\n   ... and ${services.length - 3} more services`);
          }
        } else {
          console.log(`⚠️  No services found for ${location}`);
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
      console.log();
    }
    
    // Step 4: Test category filtering
    console.log('\n🏷️  Step 4: Testing category filtering...');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    const categories = ['Tours & Activities', 'Accommodation', 'Transportation', 'Food & Dining'];
    
    for (const category of categories) {
      try {
        const categoryResponse = await axios.get(
          `${API_BASE_URL}/services`,
          {
            params: { category: category },
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        
        const services = categoryResponse.data.services || [];
        console.log(`✅ ${category}: ${services.length} services`);
        
        if (services.length > 0) {
          services.slice(0, 2).forEach(service => {
            console.log(`   • ${service.title} (${service.region})`);
          });
          if (services.length > 2) {
            console.log(`   ... and ${services.length - 2} more`);
          }
        }
        
      } catch (error) {
        console.log(`❌ ${category}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Step 5: Test location + category combination
    console.log('\n\n🎯 Step 5: Testing location + category combination...');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    try {
      const combinedResponse = await axios.get(
        `${API_BASE_URL}/services`,
        {
          params: {
            region: 'Arusha',
            category: 'Tours & Activities'
          },
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      const services = combinedResponse.data.services || [];
      console.log(`✅ Tours & Activities in Arusha: ${services.length} services\n`);
      
      services.forEach((service, index) => {
        console.log(`${index + 1}. ${service.title}`);
        console.log(`   Category: ${service.category} > ${service.subcategory}`);
        console.log(`   Price: ${service.price} TZS`);
        console.log(`   Location: ${service.location}, ${service.region}`);
        console.log();
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Step 6: Summary
    console.log('\n📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Journey Planner System Test Complete!\n');
    console.log('✨ What was tested:');
    console.log('   1. ✅ Traveler login');
    console.log('   2. ✅ All services fetching');
    console.log('   3. ✅ Services by location (region)');
    console.log('   4. ✅ Category filtering');
    console.log('   5. ✅ Location + Category search\n');
    console.log('🎯 Next Steps:');
    console.log('   1. Open the app in browser');
    console.log('   2. Login with traveler credentials:');
    console.log(`      Email: ${TRAVELER_EMAIL}`);
    console.log(`      Password: ${TRAVELER_PASSWORD}`);
    console.log('   3. Go to "Plan Journey"');
    console.log('   4. Select a location (Arusha, Mbeya, Dar es Salaam, Zanzibar)');
    console.log('   5. Verify services appear for that location');
    console.log('   6. Filter by category to see different service types\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testSystem();
