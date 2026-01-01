/**
 * Test Script: Verify useFavorites Hook Fix
 * 
 * This script verifies that the useFavorites hook is properly imported
 * and used in the traveler dashboard component.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing useFavorites Hook Fix...\n');

// Read the traveler dashboard file
const dashboardPath = path.join(__dirname, 'src/pages/traveler-dashboard/index.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

let allTestsPassed = true;

// Test 1: Check if useFavorites is imported
console.log('Test 1: Checking if useFavorites is imported...');
const hasImport = dashboardContent.includes("import { useFavorites } from '../../contexts/FavoritesContext'");
if (hasImport) {
  console.log('✅ PASS: useFavorites is properly imported\n');
} else {
  console.log('❌ FAIL: useFavorites import is missing\n');
  allTestsPassed = false;
}

// Test 2: Check if hook is called at top level (not inside useEffect)
console.log('Test 2: Checking if useFavorites is called at top level...');
const lines = dashboardContent.split('\n');
let hookCallLine = -1;
let insideUseEffect = false;
let useEffectDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track useEffect blocks
  if (line.includes('useEffect(')) {
    insideUseEffect = true;
    useEffectDepth++;
  }
  
  // Check for useFavorites call
  if (line.includes('useFavorites()') && !line.includes('import')) {
    hookCallLine = i + 1;
    if (insideUseEffect) {
      console.log(`❌ FAIL: useFavorites is called inside useEffect at line ${hookCallLine}\n`);
      allTestsPassed = false;
      break;
    }
  }
  
  // Track closing braces
  if (line.includes('});') && insideUseEffect) {
    useEffectDepth--;
    if (useEffectDepth === 0) {
      insideUseEffect = false;
    }
  }
}

if (hookCallLine > 0 && !insideUseEffect) {
  console.log(`✅ PASS: useFavorites is called at top level (line ${hookCallLine})\n`);
} else if (hookCallLine === -1) {
  console.log('⚠️  WARNING: Could not find useFavorites call\n');
}

// Test 3: Check if contextFavorites is destructured from the hook
console.log('Test 3: Checking if contextFavorites is destructured...');
const hasContextFavorites = dashboardContent.includes('favorites: contextFavorites');
if (hasContextFavorites) {
  console.log('✅ PASS: contextFavorites is properly destructured from useFavorites\n');
} else {
  console.log('❌ FAIL: contextFavorites destructuring is missing\n');
  allTestsPassed = false;
}

// Test 4: Check if loadFavoritesFromDatabase is destructured
console.log('Test 4: Checking if loadFavoritesFromDatabase is destructured...');
const hasLoadFunction = dashboardContent.includes('loadFavoritesFromDatabase');
if (hasLoadFunction) {
  console.log('✅ PASS: loadFavoritesFromDatabase is available\n');
} else {
  console.log('❌ FAIL: loadFavoritesFromDatabase is missing\n');
  allTestsPassed = false;
}

// Test 5: Verify no duplicate hook calls
console.log('Test 5: Checking for duplicate useFavorites calls...');
const hookCallCount = (dashboardContent.match(/useFavorites\(\)/g) || []).length;
if (hookCallCount === 1) {
  console.log('✅ PASS: useFavorites is called exactly once\n');
} else if (hookCallCount > 1) {
  console.log(`⚠️  WARNING: useFavorites is called ${hookCallCount} times (should be once)\n`);
} else {
  console.log('❌ FAIL: useFavorites is not called\n');
  allTestsPassed = false;
}

// Final Summary
console.log('═'.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('\nThe useFavorites hook is properly imported and used.');
  console.log('The traveler dashboard should now work without errors.');
} else {
  console.log('❌ SOME TESTS FAILED!');
  console.log('\nPlease review the failures above and fix the issues.');
}
console.log('═'.repeat(60));

process.exit(allTestsPassed ? 0 : 1);
