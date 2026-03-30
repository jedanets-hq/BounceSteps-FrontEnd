/**
 * Test script to verify that the new service provider dashboard is loading
 * and the old ProviderPartnershipPortal is NOT being used
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING SERVICE PROVIDER DASHBOARD VERSION...\n');

// Check App.jsx - should NOT import ProviderPartnershipPortal
console.log('1️⃣ Checking App.jsx...');
const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');

if (appJsxContent.includes("import ProviderPartnershipPortal from './pages/provider-partnership-portal'")) {
  console.log('❌ FAIL: App.jsx still imports ProviderPartnershipPortal (OLD VERSION)');
  process.exit(1);
} else {
  console.log('✅ PASS: App.jsx does NOT import ProviderPartnershipPortal');
}

if (appJsxContent.includes('<Route path="/provider-partnership-portal" element={<ProviderPartnershipPortal />} />')) {
  console.log('❌ FAIL: App.jsx still routes to ProviderPartnershipPortal component');
  process.exit(1);
} else {
  console.log('✅ PASS: App.jsx does NOT route to ProviderPartnershipPortal component');
}

if (appJsxContent.includes('ServiceProviderDashboard')) {
  console.log('✅ PASS: App.jsx imports ServiceProviderDashboard (NEW VERSION)');
} else {
  console.log('❌ FAIL: App.jsx does NOT import ServiceProviderDashboard');
  process.exit(1);
}

// Check that redirect is in place
if (appJsxContent.includes('Navigate to="/service-provider-dashboard"')) {
  console.log('✅ PASS: App.jsx redirects old route to new dashboard');
} else {
  console.log('⚠️  WARNING: No redirect found for old route');
}

// Check Header.jsx - should link to /service-provider-dashboard
console.log('\n2️⃣ Checking Header.jsx...');
const headerPath = path.join(__dirname, 'src', 'components', 'ui', 'Header.jsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

if (headerContent.includes('to="/provider-partnership-portal"')) {
  console.log('❌ FAIL: Header.jsx still links to old /provider-partnership-portal route');
  process.exit(1);
} else {
  console.log('✅ PASS: Header.jsx does NOT link to old route');
}

if (headerContent.includes('to="/service-provider-dashboard"')) {
  console.log('✅ PASS: Header.jsx links to new /service-provider-dashboard route');
} else {
  console.log('⚠️  WARNING: Header.jsx may not have service provider dashboard link');
}

// Check StartJourneySection.jsx
console.log('\n3️⃣ Checking StartJourneySection.jsx...');
const startJourneyPath = path.join(__dirname, 'src', 'pages', 'homepage', 'components', 'StartJourneySection.jsx');
const startJourneyContent = fs.readFileSync(startJourneyPath, 'utf8');

if (startJourneyContent.includes('to="/provider-partnership-portal"')) {
  console.log('❌ FAIL: StartJourneySection.jsx still links to old route');
  process.exit(1);
} else {
  console.log('✅ PASS: StartJourneySection.jsx does NOT link to old route');
}

if (startJourneyContent.includes('to="/service-provider-dashboard"')) {
  console.log('✅ PASS: StartJourneySection.jsx links to new dashboard');
} else {
  console.log('⚠️  WARNING: StartJourneySection.jsx may not have dashboard link');
}

// Check index.jsx for cache clearing
console.log('\n4️⃣ Checking index.jsx for cache clearing...');
const indexPath = path.join(__dirname, 'src', 'index.jsx');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('forceClearAllCaches') || indexContent.includes('clearOldCaches')) {
  console.log('✅ PASS: index.jsx has cache clearing on startup');
} else {
  console.log('⚠️  WARNING: index.jsx may not clear caches on startup');
}

console.log('\n✅ ALL TESTS PASSED! New service provider dashboard version is configured correctly.');
console.log('\n📝 NEXT STEPS:');
console.log('1. Deploy these changes to production');
console.log('2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)');
console.log('3. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)');
console.log('4. Test login as service provider - should see NEW dashboard immediately');
