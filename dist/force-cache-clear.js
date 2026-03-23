// Force cache clear on page load
(function() {
  console.log('🔄 Force Cache Clear Script Running...');
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
        console.log('🗑️ Deleted cache:', name);
      }
    });
  }
  
  // Clear localStorage items related to services and providers
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('service') || key.includes('provider') || key.includes('cache'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('🗑️ Removed localStorage:', key);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('🗑️ Cleared sessionStorage');
  
  console.log('✅ Cache clear complete!');
})();
