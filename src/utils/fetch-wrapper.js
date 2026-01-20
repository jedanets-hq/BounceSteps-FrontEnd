/**
 * Global Fetch Wrapper for iSafari Global
 * Automatically handles API base URL for live backend on Render (MongoDB Atlas)
 */

// Production backend URL with environment variable fallback
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://isafarinetworkglobal-2.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://isafarinetworkglobal-2.onrender.com/api';

console.log('🌐 API Configuration (HARDCODED):', {
  BACKEND_URL,
  API_BASE_URL,
  MODE: import.meta.env.MODE
});

// Store original fetch
const originalFetch = window.fetch;

/**
 * Enhanced fetch that automatically prepends backend URL
 * @param {string} url - The URL or endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
window.fetch = function(url, options = {}) {
  // If URL starts with /api/, prepend the backend URL
  if (typeof url === 'string' && url.startsWith('/api/')) {
    url = `${BACKEND_URL}${url}`;
    console.log('🔗 API Request:', url);
  }
  
  // Call original fetch
  return originalFetch(url, options);
};

export { API_BASE_URL };
