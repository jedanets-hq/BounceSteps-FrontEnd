#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if the latest deployment is live and cache-free
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'https://isafari-tz.netlify.app';
const BACKEND_URL = 'https://isafarinetworkglobal-2.onrender.com';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function verifyDeployment() {
  console.log('\n🔍 ========================================');
  console.log('🔍 DEPLOYMENT VERIFICATION');
  console.log('🔍 ========================================\n');

  // 1. Check local build version
  console.log('📦 Checking local build version...');
  const localVersionPath = path.join(__dirname, 'dist', 'version.json');
  
  if (!fs.existsSync(localVersionPath)) {
    console.log('❌ Local build not found. Run: npm run build:prod\n');
    return false;
  }
  
  const localVersion = JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
  console.log('   ✅ Local build:');
  console.log(`      Version: ${localVersion.version}`);
  console.log(`      Hash: ${localVersion.buildHash}`);
  console.log(`      Time: ${localVersion.buildTime}\n`);

  // 2. Check frontend deployment
  console.log('🌐 Checking frontend deployment...');
  try {
    const timestamp = Date.now();
    const versionUrl = `${FRONTEND_URL}/version.json?v=${timestamp}`;
    const { data, headers } = await httpsGet(versionUrl);
    const liveVersion = JSON.parse(data);
    
    console.log('   ✅ Live frontend:');
    console.log(`      Version: ${liveVersion.version}`);
    console.log(`      Hash: ${liveVersion.buildHash}`);
    console.log(`      Time: ${liveVersion.buildTime}`);
    console.log(`      Cache-Control: ${headers['cache-control'] || 'Not set'}\n`);
    
    // Compare versions
    if (localVersion.buildHash === liveVersion.buildHash) {
      console.log('   ✅ MATCH: Local and live versions are the same!\n');
    } else {
      console.log('   ⚠️  MISMATCH: Versions differ!');
      console.log('      This could mean:');
      console.log('      1. Deployment is still in progress (wait 2-3 minutes)');
      console.log('      2. Build was not deployed (check Netlify dashboard)');
      console.log('      3. CDN cache not cleared yet\n');
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    return false;
  }

  // 3. Check backend status
  console.log('🔧 Checking backend connection...');
  try {
    const { data } = await httpsGet(`${BACKEND_URL}/api/health`);
    const health = JSON.parse(data);
    console.log('   ✅ Backend is healthy:');
    console.log(`      Status: ${health.status || 'Unknown'}`);
    console.log(`      Database: ${health.database || 'Unknown'}\n`);
  } catch (error) {
    console.log(`   ⚠️  Backend check failed: ${error.message}`);
    console.log('      Backend might be sleeping (Render free tier)\n');
  }

  // 4. Instructions for users
  console.log('👥 USER INSTRUCTIONS:');
  console.log('   If users still see old version:');
  console.log('   1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
  console.log('   2. Clear browser cache completely');
  console.log('   3. Open in incognito/private mode');
  console.log('   4. Visit: ' + FRONTEND_URL + '?force_reload=1\n');

  console.log('🔍 ========================================');
  console.log('🔍 VERIFICATION COMPLETE');
  console.log('🔍 ========================================\n');
  
  return true;
}

verifyDeployment().catch(error => {
  console.error('\n❌ Verification failed:', error);
  process.exit(1);
});