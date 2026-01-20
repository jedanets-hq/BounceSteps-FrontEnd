/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 PRODUCTION DATABASE CONNECTION TEST
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This script verifies that:
 * 1. Frontend connects to production backend on Render
 * 2. Backend uses production PostgreSQL database
 * 3. All CRUD operations save to production database
 * 4. No localStorage fallbacks are used
 * 
 * Run: node test-production-database-connection.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

const https = require('https');

// Production backend URL
const BACKEND_URL = 'https://isafarinetworkglobal-2.onrender.com';
const API_BASE = `${BACKEND_URL}/api`;

// Test credentials (use your actual test user)
const TEST_USER = {
  email: 'test@example.com',
  password: '123456'
};

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

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('🧪 PRODUCTION DATABASE CONNECTION TEST', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  let token = null;
  let testServiceId = null;

  try {
    // Test 1: Backend Health Check
    log('📡 Test 1: Backend Health Check', 'blue');
    log(`   URL: ${API_BASE}/health`, 'blue');
    const healthResponse = await makeRequest(`${API_BASE}/health`);
    
    if (healthResponse.status === 200 && healthResponse.data.status === 'OK') {
      log('   ✅ Backend is running on Render', 'green');
      log(`   Message: ${healthResponse.data.message}`, 'green');
    } else {
      log('   ❌ Backend health check failed', 'red');
      log(`   Status: ${healthResponse.status}`, 'red');
      return;
    }

    // Test 2: User Login
    log('\n📡 Test 2: User Login', 'blue');
    log(`   URL: ${