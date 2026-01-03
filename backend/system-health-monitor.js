#!/usr/bin/env node

/**
 * System Health Monitoring Script
 * Comprehensive health check for all system components
 */

const http = require('http');
const https = require('https');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const DATABASE_URL = process.env.DATABASE_URL;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  System Health Monitor                                     ║');
console.log('║  Comprehensive health check for all components            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const healthReport = {
  timestamp: new Date().toISOString(),
  components: {},
  summary: {
    healthy: 0,
    warning: 0,
    critical: 0
  }
};

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

// Health check functions
async function checkBackendHealth() {
  console.log('🔍 Checking Backend Health...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        healthReport.components.backend = {
          status: 'healthy',
          message: 'Backend is running',
          details: data
        };
        healthReport.summary.healthy++;
        console.log('   ✅ Backend is healthy\n');
        return true;
      } catch (e) {
        healthReport.components.backend = {
          status: 'warning',
          message: 'Backend returned invalid JSON'
        };
        healthReport.summary.warning++;
        console.log('   ⚠️  Backend returned invalid JSON\n');
        return false;
      }
    } else {
      healthReport.components.backend = {
        status: 'critical',
        message: `Backend returned status ${response.status}`
      };
      healthReport.summary.critical++;
      console.log(`   ❌ Backend returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    healthReport.components.backend = {
      status: 'critical',
      message: `Cannot connect: ${error.message}`
    };
    healthReport.summary.critical++;
    console.log(`   ❌ Cannot connect to backend: ${error.message}\n`);
    return false;
  }
}

async function checkDatabaseHealth() {
  console.log('🔍 Checking Database Health...');
  
  if (!DATABASE_URL) {
    healthReport.components.database = {
      status: 'critical',
      message: 'DATABASE_URL not configured'
    };
    healthReport.summary.critical++;
    console.log('   ❌ DATABASE_URL not configured\n');
    return false;
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const result = await pool.query('SELECT NOW()');
    
    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    const requiredTables = ['users', 'services', 'cart_items', 'bookings'];
    const missingTables = requiredTables.filter(t => !tables.includes(t));

    if (missingTables.length === 0) {
      healthReport.components.database = {
        status: 'healthy',
        message: 'Database is connected and all tables exist',
        details: {
          tables: tables.length,
          requiredTables: requiredTables.length
        }
      };
      healthReport.summary.healthy++;
      console.log('   ✅ Database is healthy\n');
      return true;
    } else {
      healthReport.components.database = {
        status: 'warning',
        message: `Missing tables: ${missingTables.join(', ')}`
      };
      healthReport.summary.warning++;
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}\n`);
      return false;
    }
  } catch (error) {
    healthReport.components.database = {
      status: 'critical',
      message: `Connection failed: ${error.message}`
    };
    healthReport.summary.critical++;
    console.log(`   ❌ Database connection failed: ${error.message}\n`);
    return false;
  } finally {
    await pool.end();
  }
}

async function checkCartEndpoint() {
  console.log('🔍 Checking Cart Endpoint...');
  try {
    const response = await makeRequest(
      `${BACKEND_URL}/api/cart/add`,
      'POST',
      { Authorization: 'Bearer test-token' },
      JSON.stringify({ serviceId: 1, quantity: 1 })
    );

    if (response.status === 401 || response.status === 400 || response.status === 200) {
      healthReport.components.cartEndpoint = {
        status: 'healthy',
        message: 'Cart endpoint is accessible',
        details: { status: response.status }
      };
      healthReport.summary.healthy++;
      console.log('   ✅ Cart endpoint is accessible\n');
      return true;
    } else if (response.status === 404) {
      healthReport.components.cartEndpoint = {
        status: 'critical',
        message: 'Cart endpoint not found (404)'
      };
      healthReport.summary.critical++;
      console.log('   ❌ Cart endpoint not found (404)\n');
      return false;
    } else {
      healthReport.components.cartEndpoint = {
        status: 'warning',
        message: `Cart endpoint returned status ${response.status}`
      };
      healthReport.summary.warning++;
      console.log(`   ⚠️  Cart endpoint returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    healthReport.components.cartEndpoint = {
      status: 'critical',
      message: `Cannot reach cart endpoint: ${error.message}`
    };
    healthReport.summary.critical++;
    console.log(`   ❌ Cannot reach cart endpoint: ${error.message}\n`);
    return false;
  }
}

async function checkAuthEndpoint() {
  console.log('🔍 Checking Auth Endpoint...');
  try {
    const response = await makeRequest(
      `${BACKEND_URL}/api/auth/login`,
      'POST',
      {},
      JSON.stringify({ email: 'test@test.com', password: 'test' })
    );

    if (response.status === 401 || response.status === 400 || response.status === 200) {
      healthReport.components.authEndpoint = {
        status: 'healthy',
        message: 'Auth endpoint is accessible',
        details: { status: response.status }
      };
      healthReport.summary.healthy++;
      console.log('   ✅ Auth endpoint is accessible\n');
      return true;
    } else if (response.status === 404) {
      healthReport.components.authEndpoint = {
        status: 'critical',
        message: 'Auth endpoint not found (404)'
      };
      healthReport.summary.critical++;
      console.log('   ❌ Auth endpoint not found (404)\n');
      return false;
    } else {
      healthReport.components.authEndpoint = {
        status: 'warning',
        message: `Auth endpoint returned status ${response.status}`
      };
      healthReport.summary.warning++;
      console.log(`   ⚠️  Auth endpoint returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    healthReport.components.authEndpoint = {
      status: 'critical',
      message: `Cannot reach auth endpoint: ${error.message}`
    };
    healthReport.summary.critical++;
    console.log(`   ❌ Cannot reach auth endpoint: ${error.message}\n`);
    return false;
  }
}

async function checkServicesEndpoint() {
  console.log('🔍 Checking Services Endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/services`);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        const serviceCount = Array.isArray(data) ? data.length : (data.services?.length || 0);
        
        healthReport.components.servicesEndpoint = {
          status: 'healthy',
          message: 'Services endpoint is accessible',
          details: { serviceCount }
        };
        healthReport.summary.healthy++;
        console.log(`   ✅ Services endpoint is accessible (${serviceCount} services)\n`);
        return true;
      } catch (e) {
        healthReport.components.servicesEndpoint = {
          status: 'warning',
          message: 'Services endpoint returned invalid JSON'
        };
        healthReport.summary.warning++;
        console.log('   ⚠️  Services endpoint returned invalid JSON\n');
        return false;
      }
    } else {
      healthReport.components.servicesEndpoint = {
        status: 'critical',
        message: `Services endpoint returned status ${response.status}`
      };
      healthReport.summary.critical++;
      console.log(`   ❌ Services endpoint returned status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    healthReport.components.servicesEndpoint = {
      status: 'critical',
      message: `Cannot reach services endpoint: ${error.message}`
    };
    healthReport.summary.critical++;
    console.log(`   ❌ Cannot reach services endpoint: ${error.message}\n`);
    return false;
  }
}

async function checkCORSConfiguration() {
  console.log('🔍 Checking CORS Configuration...');
  try {
    const response = await makeRequest(
      `${BACKEND_URL}/api/health`,
      'OPTIONS',
      { Origin: 'http://localhost:4028' }
    );

    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      healthReport.components.cors = {
        status: 'healthy',
        message: 'CORS is properly configured',
        details: { allowOrigin: corsHeader }
      };
      healthReport.summary.healthy++;
      console.log(`   ✅ CORS is properly configured\n`);
      return true;
    } else {
      healthReport.components.cors = {
        status: 'warning',
        message: 'CORS headers not found'
      };
      healthReport.summary.warning++;
      console.log('   ⚠️  CORS headers not found\n');
      return false;
    }
  } catch (error) {
    healthReport.components.cors = {
      status: 'warning',
      message: `Cannot check CORS: ${error.message}`
    };
    healthReport.summary.warning++;
    console.log(`   ⚠️  Cannot check CORS: ${error.message}\n`);
    return false;
  }
}

// Run all checks
async function runHealthCheck() {
  await checkBackendHealth();
  await checkDatabaseHealth();
  await checkCartEndpoint();
  await checkAuthEndpoint();
  await checkServicesEndpoint();
  await checkCORSConfiguration();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Health Check Summary                                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`✅ Healthy: ${healthReport.summary.healthy}`);
  console.log(`⚠️  Warning: ${healthReport.summary.warning}`);
  console.log(`❌ Critical: ${healthReport.summary.critical}\n`);

  if (healthReport.summary.critical === 0) {
    console.log('🎉 System is healthy!\n');
    process.exit(0);
  } else {
    console.log('⚠️  System has critical issues. See details above.\n');
    process.exit(1);
  }
}

runHealthCheck().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
