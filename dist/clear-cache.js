// Cache Clearing Script - Runs on app load
// This ensures users always get the latest version after deployment

(function() {
  'use strict';
  
  const APP_VERSION_KEY = 'isafari_app_version';
  const LAST_CACHE_CLEAR_KEY = 'isafari_last_cache_clear';
  
  // Get current version from build with aggressive cache bypass
  const getCurrentVersion = async () => {
    try {
      // Use multiple cache-busting techniques
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const url = `/version.json?v=${timestamp}&r=${random}`;
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.version + '_' + data.buildHash + '_' + data.buildTime;
    } catch (error) {
      console.warn('Could not fetch version info:', error);
      // Return timestamp as fallback version
      return 'v_' + Date.now();
    }
  };
  
  // Clear all caches
  const clearAllCaches = async () => {
    try {
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Service Worker caches cleared');
      }
      
      // Clear localStorage (except user data)
      const userDataKeys = ['isafari_user', 'isafari_token'];
      const keysToKeep = {};
      userDataKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) keysToKeep[key] = value;
      });
      
      localStorage.clear();
      
      // Restore user data
      Object.keys(keysToKeep).forEach(key => {
        localStorage.setItem(key, keysToKeep[key]);
      });
      
      console.log('✅ localStorage cleared (user data preserved)');
      
      // Clear sessionStorage
      sessionStorage.clear();
      console.log('✅ sessionStorage cleared');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      return false;
    }
  };
  
  // Check if we need to clear cache
  const checkAndClearCache = async () => {
    const currentVersion = await getCurrentVersion();
    
    if (!currentVersion) {
      console.log('ℹ️ Could not determine app version, forcing cache clear');
      await clearAllCaches();
      return;
    }
    
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    const lastCacheClear = localStorage.getItem(LAST_CACHE_CLEAR_KEY);
    const now = Date.now();
    
    // Clear cache if:
    // 1. Version changed
    // 2. Never cleared before
    // 3. Last clear was more than 24 hours ago
    // 4. URL has force_reload parameter
    const urlParams = new URLSearchParams(window.location.search);
    const forceReload = urlParams.get('force_reload') === '1';
    
    const shouldClear = 
      forceReload ||
      !storedVersion || 
      storedVersion !== currentVersion ||
      !lastCacheClear ||
      (now - parseInt(lastCacheClear)) > 24 * 60 * 60 * 1000;
    
    if (shouldClear) {
      console.log('🔄 Cache clearing triggered:');
      console.log('   Reason:', forceReload ? 'Force reload requested' : 'Version change or cache expired');
      console.log('   Old version:', storedVersion || 'none');
      console.log('   New version:', currentVersion);
      
      const cleared = await clearAllCaches();
      
      if (cleared) {
        localStorage.setItem(APP_VERSION_KEY, currentVersion);
        localStorage.setItem(LAST_CACHE_CLEAR_KEY, now.toString());
        console.log('✅ Cache cleared successfully');
        
        // Show notification to user
        if (storedVersion && storedVersion !== currentVersion) {
          showUpdateNotification();
        }
        
        // If force reload was requested, remove the parameter and reload
        if (forceReload) {
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
          setTimeout(() => window.location.reload(true), 500);
        }
      }
    } else {
      console.log('✅ App is up to date');
      console.log('   Current version:', currentVersion);
    }
  };
  
  // Show update notification
  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>✅ App updated to latest version!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndClearCache);
  } else {
    checkAndClearCache();
  }
  
  // Expose globally for manual clearing and force reload
  window.clearAppCache = clearAllCaches;
  window.forceAppReload = () => {
    clearAllCaches().then(() => {
      window.location.href = window.location.pathname + '?force_reload=1';
    });
  };
  
  console.log('💡 Cache Management Functions:');
  console.log('   - window.clearAppCache() - Clear cache manually');
  console.log('   - window.forceAppReload() - Force reload with cache clear');
})();
