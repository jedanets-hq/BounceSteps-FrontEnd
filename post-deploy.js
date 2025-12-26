#!/usr/bin/env node

/**
 * Post-Deployment Script
 * Runs after deployment to ensure cache is cleared
 */

const https = require('https');

const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || '';
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN || '';

async function purgeCache() {
  console.log('\n🔄 ========================================');
  console.log('🔄 POST-DEPLOYMENT CACHE PURGE');
  console.log('🔄 ========================================\n');

  // If Netlify credentials are available, purge CDN cache
  if (NETLIFY_SITE_ID && NETLIFY_AUTH_TOKEN) {
    console.log('🌐 Purging Netlify CDN cache...');
    try {
      const options = {
        hostname: 'api.netlify.com',
        path: `/api/v1/sites/${NETLIFY_SITE_ID}/deploys`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('   ✅ CDN cache purged successfully\n');
            resolve();
          } else {
            console.log(`   ⚠️  Cache purge returned ${res.statusCode}\n`);
            resolve(); // Don't fail, just warn
          }
        });
        req.on('error', (error) => {
          console.log(`   ⚠️  Cache purge failed: ${error.message}\n`);
          resolve(); // Don't fail, just warn
        });
        req.end();
      });
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}\n`);
    }
  } else {
    console.log('ℹ️  Netlify credentials not set, skipping automated cache purge');
    console.log('   To enable automated purge:');
    console.log('   1. Set NETLIFY_SITE_ID in environment');
    console.log('   2. Set NETLIFY_AUTH_TOKEN in environment\n');
  }

  console.log('📝 MANUAL CACHE CLEARING OPTIONS:\n');
  console.log('1. Netlify Dashboard:');
  console.log('   - Go to: https://app.netlify.com/sites/isafari-tz/deploys');
  console.log('   - Click on latest deploy');
  console.log('   - Click "Clear cache and redeploy"\n');
  
  console.log('2. User Browser Cache:');
  console.log('   - Users visit: https://isafari-tz.netlify.app?force_reload=1');
  console.log('   - Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)\n');

  console.log('3. Service Worker:');
  console.log('   - Already handled by clear-cache.js script');
  console.log('   - Runs automatically on page load\n');

  console.log('🔄 ========================================');
  console.log('🔄 POST-DEPLOYMENT COMPLETE');
  console.log('🔄 ========================================\n');
}

purgeCache();