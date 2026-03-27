// Force cache clear by adding timestamp
const timestamp = new Date().getTime();
console.log(`Cache cleared at: ${timestamp}`);

// This file forces browsers to reload by changing content
window.CACHE_BUST = timestamp;