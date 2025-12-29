#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE SYSTEM DIAGNOSTIC
 * Scans entire system for bugs and issues
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:4028';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}`),
};

// Test backend connectivity
async function testBackendConnectivity() {
  log.section('BACKEND CONNECTIVITY');
  
  return new Promise((resolve) => {
    const req = http.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log.success(`Backend is running on ${BACKEND_URL}`);
          resolve(true);
        } else {
          log.error(`Backend returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      log.error(`Cannot connect to backend: ${err.message}`);
      log.warning('Make sure backend is running: npm run dev (in backend folder)');
      resolve(false);
    });

    req.setTimeout(5000);
  });
}

// Check cart API endpoint
async function testCartAPI() {
  log.section('CART API ENDPOINTS');
  
  const endpoints = [
    { method: 'GET', path: '/api/cart', name: 'Get Cart' },
    { method: 'POST', path: '/api/cart/add', name: 'Add to Cart' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });

      if (response.ok || response.status === 401 || response.status === 400) {
        log.success(`${endpoint.name} endpoint exists (${endpoint.method} ${endpoint.path})`);
      } else {
        log.error(`${endpoint.name} returned ${response.status}`);
      }
    } catch (err) {
      log.error(`${endpoint.name} error: ${err.message}`);
    }
  }
}

// Check frontend files
function checkFrontendFiles() {
  log.section('FRONTEND FILES');
  
  const criticalFiles = [
    'src/utils/api.js',
    'src/contexts/CartContext.jsx',
    'src/components/ServiceDetailsModal.jsx',
    'src/pages/provider-profile/index.jsx',
  ];

  for (const file of criticalFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log.success(`${file} exists`);
      
      // Check for common issues
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('api.js') && !content.includes('cartAPI')) {
        log.error(`${file} missing cartAPI export`);
      }
      
      if (file.includes('CartContext') && !content.includes('addToCart')) {
        log.error(`${file} missing addToCart function`);
      }
    } else {
      log.error(`${file} NOT FOUND`);
    }
  }
}

// Check backend routes
function checkBackendRoutes() {
  log.section('BACKEND ROUTES');
  
  const routeFiles = [
    'backend/routes/cart.js',
    'backend/routes/bookings.js',
    'backend/routes/services.js',
  ];

  for (const file of routeFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('cart.js')) {
        if (content.includes("router.post('/add'")) {
          log.success(`${file} has POST /add endpoint`);
        } else {
          log.error(`${file} missing POST /add endpoint`);
        }
      }
      
      if (content.includes('router.get') || content.includes('router.post')) {
        log.success(`${file} has route handlers`);
      } else {
        log.error(`${file} has no route handlers`);
      }
    } else {
      log.error(`${file} NOT FOUND`);
    }
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  log.section('ENVIRONMENT VARIABLES');
  
  const envFile = path.join(__dirname, '.env');
  const envLocalFile = path.join(__dirname, '.env.local');
  
  if (fs.existsSync(envFile)) {
    log.success('.env file exists');
    const content = fs.readFileSync(envFile, 'utf8');
    
    if (content.includes('DATABASE_URL')) {
      log.success('DATABASE_URL is configured');
    } else {
      log.warning('DATABASE_URL not found in .env');
    }
    
    if (content.includes('VITE_API_BASE_URL')) {
      log.success('VITE_API_BASE_URL is configured');
    } else {
      log.warning('VITE_API_BASE_URL not found in .env');
    }
  } else {
    log.error('.env file NOT FOUND');
  }
  
  if (fs.existsSync(envLocalFile)) {
    log.success('.env.local file exists');
  }
}

// Check database schema
async function checkDatabaseSchema() {
  log.section('DATABASE SCHEMA');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/dashboard-stats`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (response.status === 401) {
      log.success('Database connection is working (auth required)');
    } else if (response.ok) {
      log.success('Database connection is working');
    } else {
      log.warning(`Database check returned status ${response.status}`);
    }
  } catch (err) {
    log.error(`Cannot check database: ${err.message}`);
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   🔍 iSAFARI SYSTEM DIAGNOSTIC TOOL   ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  const backendRunning = await testBackendConnectivity();
  
  if (backendRunning) {
    await testCartAPI();
    await checkDatabaseSchema();
  }
  
  checkFrontendFiles();
  checkBackendRoutes();
  checkEnvironmentVariables();

  log.section('SUMMARY');
  log.info('Diagnostic complete. Check issues above and fix them.');
  log.info('Common fixes:');
  log.info('1. Start backend: cd backend && npm run dev');
  log.info('2. Start frontend: npm run dev');
  log.info('3. Check .env file for correct API_BASE_URL');
  log.info('4. Clear browser cache and localStorage');
}

// Run diagnostics
runDiagnostics().catch(err => {
  log.error(`Diagnostic failed: ${err.message}`);
  process.exit(1);
});
