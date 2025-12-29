const http = require('http');
const { pool } = require('./backend/config/postgresql');
const dotenv = require('dotenv');
const path = require('path');

// Load backend env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const makeRequest = (hostname, port, path, method = 'GET') => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: { error: data }
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

(async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  System Health Check                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Check Backend
    console.log('1️⃣  Checking Backend Server (Port 5000)...');
    try {
      const backendRes = await makeRequest('localhost', 5000, '/api/health');
      if (backendRes.status === 200) {
        console.log('   ✅ Backend is running\n');
      } else {
        console.log(`   ⚠️  Backend returned status ${backendRes.status}\n`);
      }
    } catch (e) {
      console.log(`   ❌ Backend not responding: ${e.message}\n`);
    }

    // 2. Check Frontend
    console.log('2️⃣  Checking Frontend Server (Port 4028)...');
    try {
      const frontendRes = await makeRequest('localhost', 4028, '/');
      if (frontendRes.status === 200 || frontendRes.status === 304) {
        console.log('   ✅ Frontend is running\n');
      } else {
        console.log(`   ⚠️  Frontend returned status ${frontendRes.status}\n`);
      }
    } catch (e) {
      console.log(`   ⚠️  Frontend not responding: ${e.message}\n`);
    }

    // 3. Check Database
    console.log('3️⃣  Checking Database Connection...');
    try {
      const dbRes = await pool.query('SELECT NOW()');
      console.log('   ✅ Database connected\n');
    } catch (e) {
      console.log(`   ❌ Database error: ${e.message}\n`);
    }

    // 4. Check Cart API
    console.log('4️⃣  Checking Cart API Endpoints...');
    try {
      const cartRes = await makeRequest('localhost', 5000, '/api/cart');
      if (cartRes.status === 401) {
        console.log('   ✅ Cart endpoint exists (requires auth)\n');
      } else if (cartRes.status === 200) {
        console.log('   ✅ Cart endpoint accessible\n');
      } else {
        console.log(`   ⚠️  Cart endpoint returned ${cartRes.status}\n`);
      }
    } catch (e) {
      console.log(`   ❌ Cart endpoint error: ${e.message}\n`);
    }

    // 5. Check Database Tables
    console.log('5️⃣  Checking Database Tables...');
    const tables = ['users', 'services', 'cart_items', 'service_providers'];
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ✅ ${table}: ${result.rows[0].count} records`);
      } catch (e) {
        console.log(`   ❌ ${table}: ${e.message}`);
      }
    }
    console.log();

    // 6. Check Environment Variables
    console.log('6️⃣  Checking Environment Variables...');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`   ✅ ${varName} is set`);
      } else {
        console.log(`   ❌ ${varName} is missing`);
      }
    }
    console.log();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ System Health Check Complete!                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
