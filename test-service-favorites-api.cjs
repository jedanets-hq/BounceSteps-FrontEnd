const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  email: 'testfavorites@test.com',
  password: 'Test123!'
};

let authToken = null;
let testServiceId = null;

async function login() {
  console.log('\n1️⃣ Logging in...');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });
  
  const data = await response.json();
  if (data.success && data.token) {
    authToken = data.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.error('❌ Login failed:', data.message);
    return false;
  }
}

async function getServices() {
  console.log('\n2️⃣ Getting services...');
  const response = await fetch(`${API_URL}/services`);
  const data = await response.json();
  
  if (data.success && data.services && data.services.length > 0) {
    testServiceId = data.services[0].id;
    console.log(`✅ Found ${data.services.length} services`);
    console.log(`   Using service ID: ${testServiceId} - ${data.services[0].title}`);
    return true;
  } else {
    console.error('❌ No services found');
    return false;
  }
}

async function addServiceToFavorites() {
  console.log('\n3️⃣ Adding service to favorites...');
  const response = await fetch(`${API_URL}/favorites/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ serviceId: testServiceId })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Service added to favorites:', data.message);
    return true;
  } else {
    console.error('❌ Failed to add to favorites:', data.message);
    return false;
  }
}

async function getFavorites() {
  console.log('\n4️⃣ Getting all favorites...');
  const response = await fetch(`${API_URL}/favorites`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log(`✅ Found ${data.favorites.length} favorites:`);
    
    const serviceFavorites = data.favorites.filter(f => f.service_id);
    const providerFavorites = data.favorites.filter(f => f.provider_id);
    
    console.log(`   - ${serviceFavorites.length} service favorites`);
    console.log(`   - ${providerFavorites.length} provider favorites`);
    
    if (serviceFavorites.length > 0) {
      console.log('\n   Service Favorites:');
      serviceFavorites.forEach(fav => {
        console.log(`   • ${fav.service_title} - TZS ${fav.service_price}`);
      });
    }
    
    if (providerFavorites.length > 0) {
      console.log('\n   Provider Favorites:');
      providerFavorites.forEach(fav => {
        console.log(`   • ${fav.business_name}`);
      });
    }
    
    return true;
  } else {
    console.error('❌ Failed to get favorites:', data.message);
    return false;
  }
}

async function checkServiceFavorite() {
  console.log('\n5️⃣ Checking if service is favorited...');
  const response = await fetch(`${API_URL}/favorites/check/service/${testServiceId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log(`✅ Service favorite status: ${data.isFavorite ? 'YES' : 'NO'}`);
    return true;
  } else {
    console.error('❌ Failed to check favorite:', data.message);
    return false;
  }
}

async function removeServiceFromFavorites() {
  console.log('\n6️⃣ Removing service from favorites...');
  const response = await fetch(`${API_URL}/favorites/service/${testServiceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Service removed from favorites');
    return true;
  } else {
    console.error('❌ Failed to remove from favorites:', data.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Service Favorites API...\n');
  console.log('='.repeat(50));
  
  try {
    if (!await login()) return;
    if (!await getServices()) return;
    if (!await addServiceToFavorites()) return;
    if (!await getFavorites()) return;
    if (!await checkServiceFavorite()) return;
    if (!await removeServiceFromFavorites()) return;
    
    // Verify removal
    console.log('\n7️⃣ Verifying removal...');
    await getFavorites();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

runTests();
