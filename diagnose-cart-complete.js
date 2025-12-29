const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function diagnoseCartIssue() {
  console.log('🔍 COMPREHENSIVE CART SYSTEM DIAGNOSIS\n');
  console.log('=' .repeat(60));
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // Check 1: Backend running
  console.log('\n1️⃣ Checking if backend is running...');
  try {
    const health = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Backend is running');
    results.checks.push({ name: 'Backend Health', status: 'PASS', data: health.data });
  } catch (error) {
    console.log('❌ Backend is NOT running');
    console.log('   Error:', error.message);
    results.checks.push({ name: 'Backend Health', status: 'FAIL', error: error.message });
    console.log('\n⚠️  Please start backend with: npm run dev (in backend folder)');
    return results;
  }

  // Check 2: Cart endpoint exists
  console.log('\n2️⃣ Checking if cart endpoint is registered...');
  try {
    await axios.get('http://localhost:5000/api/cart', { timeout: 5000 });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Cart endpoint exists (401 Unauthorized - expected without token)');
      results.checks.push({ name: 'Cart Endpoint', status: 'PASS', note: '401 Unauthorized (expected)' });
    } else if (error.response?.status === 404) {
      console.log('❌ Cart endpoint NOT found (404)');
      results.checks.push({ name: 'Cart Endpoint', status: 'FAIL', error: '404 Not Found' });
    } else {
      console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data);
      results.checks.push({ name: 'Cart Endpoint', status: 'UNKNOWN', error: error.message });
    }
  }

  // Check 3: Cart add endpoint
  console.log('\n3️⃣ Checking cart add endpoint...');
  try {
    await axios.post('http://localhost:5000/api/cart/add', { serviceId: 1 }, { timeout: 5000 });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Cart add endpoint exists (401 Unauthorized - expected without token)');
      results.checks.push({ name: 'Cart Add Endpoint', status: 'PASS', note: '401 Unauthorized (expected)' });
    } else if (error.response?.status === 404) {
      console.log('❌ Cart add endpoint NOT found (404)');
      results.checks.push({ name: 'Cart Add Endpoint', status: 'FAIL', error: '404 Not Found' });
    } else {
      console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data);
      results.checks.push({ name: 'Cart Add Endpoint', status: 'UNKNOWN', error: error.message });
    }
  }

  // Check 4: API URL configuration
  console.log('\n4️⃣ Checking API URL configuration...');
  const envFiles = ['.env', '.env.local', 'backend/.env'];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const apiUrl = content.match(/VITE_API_BASE_URL=(.+)/)?.[1];
      console.log(`   ${file}: ${apiUrl || 'NOT SET'}`);
      results.checks.push({ name: `API URL in ${file}`, status: 'INFO', value: apiUrl });
    }
  }

  // Check 5: Backend server.js routes
  console.log('\n5️⃣ Checking backend server.js for cart routes...');
  const serverFile = 'backend/server.js';
  if (fs.existsSync(serverFile)) {
    const content = fs.readFileSync(serverFile, 'utf8');
    const hasCartImport = content.includes("require('./routes/cart')");
    const hasCartRoute = content.includes("app.use('/api/cart'");
    
    console.log(`   Cart import: ${hasCartImport ? '✅' : '❌'}`);
    console.log(`   Cart route: ${hasCartRoute ? '✅' : '❌'}`);
    
    results.checks.push({ 
      name: 'Backend Cart Routes', 
      status: (hasCartImport && hasCartRoute) ? 'PASS' : 'FAIL',
      cartImport: hasCartImport,
      cartRoute: hasCartRoute
    });
  }

  // Check 6: Cart API file
  console.log('\n6️⃣ Checking cart API functions...');
  const cartApiFile = 'backend/routes/cart.js';
  if (fs.existsSync(cartApiFile)) {
    const content = fs.readFileSync(cartApiFile, 'utf8');
    const hasGetRoute = content.includes("router.get('/'");
    const hasAddRoute = content.includes("router.post('/add'");
    const hasUpdateRoute = content.includes("router.put('/:cartItemId'");
    const hasDeleteRoute = content.includes("router.delete('/:cartItemId'");
    
    console.log(`   GET / route: ${hasGetRoute ? '✅' : '❌'}`);
    console.log(`   POST /add route: ${hasAddRoute ? '✅' : '❌'}`);
    console.log(`   PUT /:cartItemId route: ${hasUpdateRoute ? '✅' : '❌'}`);
    console.log(`   DELETE /:cartItemId route: ${hasDeleteRoute ? '✅' : '❌'}`);
    
    results.checks.push({ 
      name: 'Cart Routes Implementation', 
      status: (hasGetRoute && hasAddRoute && hasUpdateRoute && hasDeleteRoute) ? 'PASS' : 'FAIL',
      routes: { hasGetRoute, hasAddRoute, hasUpdateRoute, hasDeleteRoute }
    });
  }

  // Check 7: Frontend API client
  console.log('\n7️⃣ Checking frontend API client...');
  const apiFile = 'src/utils/api.js';
  if (fs.existsSync(apiFile)) {
    const content = fs.readFileSync(apiFile, 'utf8');
    const hasCartAPI = content.includes('export const cartAPI');
    const hasAddToCart = content.includes('addToCart:');
    
    console.log(`   cartAPI export: ${hasCartAPI ? '✅' : '❌'}`);
    console.log(`   addToCart function: ${hasAddToCart ? '✅' : '❌'}`);
    
    results.checks.push({ 
      name: 'Frontend Cart API', 
      status: (hasCartAPI && hasAddToCart) ? 'PASS' : 'FAIL',
      hasCartAPI,
      hasAddToCart
    });
  }

  // Check 8: Database cart table
  console.log('\n8️⃣ Checking database configuration...');
  const dbConfigFile = 'backend/config/postgresql.js';
  if (fs.existsSync(dbConfigFile)) {
    const content = fs.readFileSync(dbConfigFile, 'utf8');
    const hasCartTable = content.includes('CREATE TABLE IF NOT EXISTS cart_items');
    
    console.log(`   cart_items table definition: ${hasCartTable ? '✅' : '❌'}`);
    
    results.checks.push({ 
      name: 'Database Cart Table', 
      status: hasCartTable ? 'PASS' : 'FAIL',
      hasCartTable
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSIS SUMMARY\n');
  
  const passed = results.checks.filter(c => c.status === 'PASS').length;
  const failed = results.checks.filter(c => c.status === 'FAIL').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`ℹ️  Info: ${results.checks.filter(c => c.status === 'INFO').length}`);
  
  if (failed > 0) {
    console.log('\n🔧 ISSUES FOUND:');
    results.checks.filter(c => c.status === 'FAIL').forEach(check => {
      console.log(`   - ${check.name}: ${check.error || 'Check failed'}`);
    });
  }

  // Save results
  fs.writeFileSync('cart-diagnosis-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Full results saved to: cart-diagnosis-results.json');
  
  return results;
}

diagnoseCartIssue().catch(console.error);
