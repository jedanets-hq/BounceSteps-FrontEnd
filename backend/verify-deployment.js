#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that deployment was successful and changes are live
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://isafari-tz.netlify.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://isafarinetworkglobal-2.onrender.com';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkFrontendVersion() {
  log('\n📦 Checking Frontend Version...', 'cyan');
  
  try {
    const response = await fetchUrl(`${FRONTEND_URL}/version.json?t=${Date.now()}`);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    const version = JSON.parse(response.body);
    log(`✅ Frontend Version: ${version.version}`, 'green');
    log(`   Build Hash: ${version.buildHash}`, 'blue');
    log(`   Build Time: ${version.buildTime}`, 'blue');
    log(`   Environment: ${version.environment}`, 'blue');
    
    return { success: true, version };
  } catch (error) {
    log(`❌ Frontend version check failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function checkBackendAPI() {
  log('\n🔌 Checking Backend API...', 'cyan');
  
  try {
    const response = await fetchUrl(`${BACKEND_URL}/api/health`);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    log('✅ Backend API is responding', 'green');
    return { success: true };
  } catch (error) {
    log(`❌ Backend API check failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function checkCacheHeaders() {
  log('\n🗄️  Checking Cache Headers...', 'cyan');
  
  try {
    // Check HTML cache headers
    const htmlResponse = await fetchUrl(FRONTEND_URL);
    const htmlCache = htmlResponse.headers['cache-control'] || '';
    
    if (!htmlCache.includes('no-cache') && !htmlCache.includes('no-store')) {
      log('⚠️  Warning: HTML may be cached', 'yellow');
      log(`   Cache-Control: ${htmlCache}`, 'yellow');
    } else {
      log('✅ HTML cache headers correct', 'green');
      log(`   Cache-Control: ${htmlCache}`, 'blue');
    }
    
    // Check version.json cache headers
    const versionResponse = await fetchUrl(`${FRONTEND_URL}/version.json?t=${Date.now()}`);
    const versionCache = versionResponse.headers['cache-control'] || '';
    
    if (!versionCache.includes('no-cache')) {
      log('⚠️  Warning: version.json may be cached', 'yellow');
      log(`   Cache-Control: ${versionCache}`, 'yellow');
    } else {
      log('✅ version.json cache headers correct', 'green');
    }
    
    return { success: true };
  } catch (error) {
    log(`❌ Cache headers check failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function checkAssetLoading() {
  log('\n📁 Checking Asset Loading...', 'cyan');
  
  try {
    const response = await fetchUrl(FRONTEND_URL);
    const html = response.body;
    
    // Check for hashed assets
    const hasHashedJS = html.includes('assets/') && html.includes('.js');
    const hasHashedCSS = html.includes('assets/') && html.includes('.css');
    
    if (hasHashedJS) {
      log('✅ JavaScript assets are hashed', 'green');
    } else {
      log('⚠️  Warning: JavaScript assets may not be hashed', 'yellow');
    }
    
    if (hasHashedCSS) {
      log('✅ CSS assets are hashed', 'green');
    } else {
      log('⚠️  Warning: CSS assets may not be hashed', 'yellow');
    }
    
    return { success: true };
  } catch (error) {
    log(`❌ Asset loading check failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllChecks() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 iSafari Global - Deployment Verification', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Frontend: ${FRONTEND_URL}`, 'blue');
  log(`Backend:  ${BACKEND_URL}`, 'blue');
  
  const checks = [
    { name: 'Frontend Version', fn: checkFrontendVersion },
    { name: 'Backend API', fn: checkBackendAPI },
    { name: 'Cache Headers', fn: checkCacheHeaders },
    { name: 'Asset Loading', fn: checkAssetLoading }
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const check of checks) {
    const result = await check.fn();
    results.push({ name: check.name, ...result });
    
    if (!result.success) {
      allPassed = false;
    }
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Verification Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });
  
  log('\n' + '='.repeat(60), 'cyan');
  
  if (allPassed) {
    log('🎉 All checks passed! Deployment successful!', 'green');
    process.exit(0);
  } else {
    log('❌ Some checks failed. Please review the errors above.', 'red');
    process.exit(1);
  }
}

// Run verification
runAllChecks().catch(error => {
  log(`\n❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});