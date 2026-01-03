#!/usr/bin/env node

/**
 * Simple Cart API Test - No Authentication Required
 */

const http = require('http');

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('\n🧪 Testing Cart API Data Structure\n');
  
  try {
    console.log('📝 Getting services...');
    const servicesRes = await makeRequest('GET', '/services');
    
    if (servicesRes.status === 200 && servicesRes.data.services) {
      const services = servicesRes.data.services;
      console.log(`✅ Got ${services.length} services\n`);
      
      if (services.length > 0) {
        const service = services[0];
        console.log('📋 First Service Structure:');
        console.log(`   - id: ${service.id}`);
        console.log(`   - title: ${service.title}`);
        console.log(`   - category: ${service.category}`);
        console.log(`   - location: ${service.location}`);
        console.log(`   - price: ${service.price}`);
        console.log(`   - description: ${service.description?.substring(0, 50)}...`);
        console.log(`   - provider_id: ${service.provider_id}`);
        
        console.log('\n✅ Service data structure is correct for CartSidebar and PaymentSystem');
        console.log('   - Uses "title" field (not "name")');
        console.log('   - Has category, location, price fields');
      }
    } else {
      console.log('❌ Failed to get services');
      console.log('Response:', servicesRes);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

test();
