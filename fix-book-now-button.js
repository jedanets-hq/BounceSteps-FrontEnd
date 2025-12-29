#!/usr/bin/env node

/**
 * Fix "Book Now" Button - Complete Diagnostic and Fix
 * Addresses: "Error adding to cart: API endpoint not found"
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  iSafari Global - "Book Now" Button Fix                   ║');
console.log('║  Diagnosing: Error adding to cart: API endpoint not found ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// Diagnostic tests
async function runDiagnostics() {
  console.log('📋 RUNNING DIAGNOSTICS...\n');

  // Test 1: Backend Health
  console.log('1️⃣  Testing Backend Health...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    if (response.status === 200) {
      console.log('   ✅ Backend is running on port 5000\n');
    } else {
      console.log(`   ❌ Backend returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot connect to backend: ${error.message}`);
    console.log('   💡 Make sure backend is running: npm run dev:backend\n');
    return false;
  }

  // Test 2: Cart Endpoint
  console.log('2️⃣  Testing Cart Endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/cart/add`, 'POST', {
      'Authorization': 'Bearer test-token'
    }, JSON.stringify({ serviceId: 1, quantity: 1 }));
    
    if (response.status === 401 || response.status === 400 || response.status === 200) {
      console.log(`   ✅ Cart endpoint exists (status: ${response.status})\n`);
    } else if (response.status === 404) {
      console.log('   ❌ Cart endpoint NOT FOUND (404)');
      console.log('   💡 Cart routes may not be registered in backend/server.js\n');
      return false;
    } else {
      console.log(`   ⚠️  Cart endpoint returned status ${response.status}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Cannot reach cart endpoint: ${error.message}\n`);
    return false;
  }

  // Test 3: CORS Headers
  console.log('3️⃣  Testing CORS Configuration...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`, 'OPTIONS', {
      'Origin': 'http://localhost:4028',
      'Access-Control-Request-Method': 'POST'
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log(`   ✅ CORS enabled: ${corsHeader}\n`);
    } else {
      console.log('   ⚠️  CORS headers not found (may be OK in development)\n');
    }
  } catch (error) {
    console.log(`   ⚠️  Cannot test CORS: ${error.message}\n`);
  }

  // Test 4: Check backend/server.js
  console.log('4️⃣  Checking Backend Configuration...');
  try {
    const serverPath = path.join(__dirname, 'backend', 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (serverContent.includes("require('./routes/cart')")) {
      console.log('   ✅ Cart routes are imported\n');
    } else {
      console.log('   ❌ Cart routes NOT imported in server.js\n');
      return false;
    }

    if (serverContent.includes("app.use('/api/cart'")) {
      console.log('   ✅ Cart routes are registered\n');
    } else {
      console.log('   ❌ Cart routes NOT registered in server.js\n');
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Cannot check server.js: ${error.message}\n`);
  }

  // Test 5: Check backend/routes/cart.js
  console.log('5️⃣  Checking Cart Routes...');
  try {
    const cartPath = path.join(__dirname, 'backend', 'routes', 'cart.js');
    if (fs.existsSync(cartPath)) {
      const cartContent = fs.readFileSync(cartPath, 'utf8');
      
      if (cartContent.includes("router.post('/add'")) {
        console.log('   ✅ POST /api/cart/add endpoint is defined\n');
      } else {
        console.log('   ❌ POST /api/cart/add endpoint NOT defined\n');
        return false;
      }
    } else {
      console.log('   ❌ backend/routes/cart.js does not exist\n');
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Cannot check cart.js: ${error.message}\n`);
  }

  // Test 6: Check frontend API configuration
  console.log('6️⃣  Checking Frontend API Configuration...');
  try {
    const apiPath = path.join(__dirname, 'src', 'utils', 'api.js');
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    
    if (apiContent.includes('cartAPI')) {
      console.log('   ✅ Frontend has cartAPI functions\n');
    } else {
      console.log('   ❌ Frontend missing cartAPI functions\n');
      return false;
    }

    if (apiContent.includes("'/cart/add'")) {
      console.log('   ✅ Frontend has addToCart function\n');
    } else {
      console.log('   ❌ Frontend missing addToCart function\n');
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Cannot check api.js: ${error.message}\n`);
  }

  return true;
}

// Main execution
async function main() {
  const allGood = await runDiagnostics();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  RECOMMENDATIONS                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (allGood) {
    console.log('✅ All systems appear to be configured correctly!\n');
    console.log('If you\'re still seeing the error, try:\n');
    console.log('1. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)');
    console.log('2. Restart the backend: npm run dev:backend');
    console.log('3. Restart the frontend: npm run dev');
    console.log('4. Check browser console for detailed error messages\n');
  } else {
    console.log('❌ Issues found. Here\'s what to do:\n');
    console.log('1. Make sure backend is running:');
    console.log('   npm run dev:backend\n');
    console.log('2. Make sure frontend is running:');
    console.log('   npm run dev\n');
    console.log('3. Check that .env.local has correct API URL:');
    console.log('   VITE_API_BASE_URL=http://localhost:5000/api\n');
    console.log('4. Verify database is connected:');
    console.log('   Check backend logs for "PostgreSQL connected"\n');
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  TESTING THE FIX                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('To test the "Book Now" button:\n');
  console.log('1. Open http://localhost:4028 in your browser');
  console.log('2. Login with a traveler account');
  console.log('3. Find a service and click "Book Now"');
  console.log('4. Check browser console (F12) for any errors');
  console.log('5. Check that item appears in cart\n');

  process.exit(allGood ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
