#!/usr/bin/env node

/**
 * TEST JOURNEY PLANNER API
 * 
 * Hii script itatest jinsi API inajibu kwa requests kutoka journey planner
 * Tutatest filtering kwa:
 * - Region: Mbeya
 * - District: Mbeya CBD
 * - Category: Accommodation
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

async function testAPI() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING JOURNEY PLANNER API');
    console.log('='.repeat(80) + '\n');

    // Test 1: Get all services
    console.log('📊 TEST 1: Get all services (no filters)');
    console.log('-'.repeat(80));
    
    let response = await fetch(`${API_URL}/services?limit=5`);
    let data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Total services in DB: ${data.total}`);
    console.log(`Services returned: ${data.services?.length || 0}`);
    
    if (data.services && data.services.length > 0) {
      console.log('\nFirst service:');
      const s = data.services[0];
      console.log(`  - Title: ${s.title}`);
      console.log(`  - Category: ${s.category}`);
      console.log(`  - Region: ${s.region}`);
      console.log(`  - District: ${s.district}`);
      console.log(`  - Area: ${s.area}`);
    }

    // Test 2: Get services by category
    console.log('\n\n📊 TEST 2: Get services by category (Accommodation)');
    console.log('-'.repeat(80));
    
    response = await fetch(`${API_URL}/services?category=Accommodation&limit=10`);
    data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Total Accommodation services: ${data.total}`);
    console.log(`Services returned: ${data.services?.length || 0}`);
    
    if (data.services && data.services.length > 0) {
      console.log('\nAccommodation services:');
      data.services.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title}`);
        console.log(`     Region: ${s.region}, District: ${s.district}, Area: ${s.area}`);
      });
    } else {
      console.log('❌ NO ACCOMMODATION SERVICES FOUND!');
    }

    // Test 3: Get services by region
    console.log('\n\n📊 TEST 3: Get services by region (Mbeya)');
    console.log('-'.repeat(80));
    
    response = await fetch(`${API_URL}/services?region=Mbeya&limit=10`);
    data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Total services in Mbeya: ${data.total}`);
    console.log(`Services returned: ${data.services?.length || 0}`);
    
    if (data.services && data.services.length > 0) {
      console.log('\nMbeya services:');
      data.services.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title} (${s.category})`);
        console.log(`     District: ${s.district}, Area: ${s.area}`);
      });
    } else {
      console.log('❌ NO SERVICES FOUND IN MBEYA!');
    }

    // Test 4: Get services by region AND category
    console.log('\n\n📊 TEST 4: Get services by region AND category (Mbeya + Accommodation)');
    console.log('-'.repeat(80));
    
    response = await fetch(`${API_URL}/services?region=Mbeya&category=Accommodation&limit=10`);
    data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Total Accommodation services in Mbeya: ${data.total}`);
    console.log(`Services returned: ${data.services?.length || 0}`);
    
    if (data.services && data.services.length > 0) {
      console.log('\nMbeya Accommodation services:');
      data.services.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title}`);
        console.log(`     District: ${s.district}, Area: ${s.area}`);
      });
    } else {
      console.log('❌ NO ACCOMMODATION SERVICES FOUND IN MBEYA!');
    }

    // Test 5: Get services by region, district, AND category
    console.log('\n\n📊 TEST 5: Get services by region, district, AND category');
    console.log('   (Mbeya + Mbeya CBD + Accommodation)');
    console.log('-'.repeat(80));
    
    response = await fetch(`${API_URL}/services?region=Mbeya&district=Mbeya%20CBD&category=Accommodation&limit=10`);
    data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Total services: ${data.total}`);
    console.log(`Services returned: ${data.services?.length || 0}`);
    
    if (data.services && data.services.length > 0) {
      console.log('\nServices found:');
      data.services.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title}`);
        console.log(`     Category: ${s.category}, Region: ${s.region}, District: ${s.district}, Area: ${s.area}`);
      });
    } else {
      console.log('❌ NO SERVICES FOUND WITH THIS FILTER!');
      console.log('\n🔍 DEBUG: Checking what categories exist in Mbeya...');
      
      response = await fetch(`${API_URL}/services?region=Mbeya&limit=100`);
      data = await response.json();
      
      if (data.services && data.services.length > 0) {
        const categories = [...new Set(data.services.map(s => s.category))];
        console.log(`Available categories in Mbeya: ${categories.join(', ')}`);
        
        const districts = [...new Set(data.services.map(s => s.district).filter(Boolean))];
        console.log(`Available districts in Mbeya: ${districts.join(', ')}`);
      }
    }

    // Test 6: Check providers endpoint
    console.log('\n\n📊 TEST 6: Get providers by region (Mbeya)');
    console.log('-'.repeat(80));
    
    response = await fetch(`${API_URL}/providers?region=Mbeya&limit=10`);
    data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Total providers in Mbeya: ${data.total}`);
    console.log(`Providers returned: ${data.providers?.length || 0}`);
    
    if (data.providers && data.providers.length > 0) {
      console.log('\nMbeya providers:');
      data.providers.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.business_name}`);
        console.log(`     Region: ${p.region}, District: ${p.district}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ API TESTS COMPLETE');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    console.error(error);
    process.exi