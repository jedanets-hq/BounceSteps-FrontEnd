/**
 * Check which routes are available on the backend
 */

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

const endpoints = [
  '/health',
  '/auth/login',
  '/services',
  '/providers',
  '/cart',
  '/cart/test',
  '/favorites',
  '/favorites/test',
  '/plans',
  '/bookings',
  '/users/profile'
];

async function checkEndpoints() {
  console.log('🔍 Checking backend endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`);
      const status = res.status;
      let statusText = '';
      
      if (status === 200) statusText = '✅ OK';
      else if (status === 401) statusText = '🔐 Auth Required (route exists)';
      else if (status === 404) statusText = '❌ NOT FOUND';
      else if (status === 500) statusText = '⚠️ Server Error';
      else statusText = `⚠️ ${status}`;
      
      console.log(`${endpoint.padEnd(20)} → ${status} ${statusText}`);
    } catch (error) {
      console.log(`${endpoint.padEnd(20)} → ❌ Error: ${error.message}`);
    }
  }
}

checkEndpoints();
