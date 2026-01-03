/**
 * Clear MongoDB Cache Utility
 * 
 * This utility clears all MongoDB-related data from browser storage
 * to ensure the app uses only PostgreSQL data.
 */

export const clearMongoDBCache = () => {
  try {
    console.log('🗑️ Clearing MongoDB cache...');
    
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    // Clear all localStorage items
    keys.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log(`✅ Cleared ${clearedCount} localStorage items`);
    console.log('✅ Cleared sessionStorage');
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

export const clearAllBrowserData = async () => {
  try {
    console.log('🗑️ Clearing ALL browser data...');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB
    if (window.indexedDB) {
      try {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          window.indexedDB.deleteDatabase(db.name);
          console.log(`✅ Deleted IndexedDB: ${db.name}`);
        }
      } catch (e) {
        console.warn('⚠️ Could not clear IndexedDB:', e);
      }
    }
    
    // Clear Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('✅ Unregistered Service Worker');
      }
    }
    
    // Clear Cache API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Cleared Cache API');
    }
    
    console.log('✅ All browser data cleared!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing browser data:', error);
    return false;
  }
};

export const checkForMongoDBData = () => {
  const keys = Object.keys(localStorage);
  const mongoKeys = keys.filter(key => {
    const value = localStorage.getItem(key);
    // Check if value contains MongoDB ObjectId pattern
    return value && value.includes('"_id"') && value.match(/[a-f0-9]{24}/);
  });
  
  if (mongoKeys.length > 0) {
    console.warn('⚠️ Found MongoDB data in localStorage:', mongoKeys);
    return true;
  }
  
  return false;
};

export const forcePostgreSQLMode = () => {
  // Set a flag to indicate we're using PostgreSQL
  localStorage.setItem('database_mode', 'postgresql');
  localStorage.setItem('migration_complete', 'true');
  localStorage.setItem('last_cache_clear', new Date().toISOString());
  
  console.log('✅ PostgreSQL mode activated');
};

export const isPostgreSQLMode = () => {
  return localStorage.getItem('database_mode') === 'postgresql';
};
