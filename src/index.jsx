import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/tailwind.css";
import "./styles/index.css";

// CRITICAL: Force clear ALL caches and reload to prevent old version from showing
const forceClearAllCaches = async () => {
  try {
    console.log('🧹 FORCE CLEARING ALL CACHES...');
    
    // Clear all browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Cleared', cacheNames.length, 'browser caches');
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      if (registrations.length > 0) {
        console.log('✅ Unregistered', registrations.length, 'service workers');
      }
    }
    
    // Clear localStorage items that might cache old routes
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('route') || key.includes('navigation') || key.includes('cache'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
      console.log('✅ Cleared', keysToRemove.length, 'cached route items from localStorage');
    }
    
    // DO NOT clear sessionStorage - it contains important user data like Google registration info
    // sessionStorage is automatically cleared when browser/tab is closed
    console.log('✅ Preserved sessionStorage for user data');
    
    console.log('✅ ALL CACHES CLEARED SUCCESSFULLY');
  } catch (e) {
    console.warn('⚠️ Cache clearing failed:', e);
  }
};

// Run cache clearing on EVERY startup to ensure fresh version
forceClearAllCaches();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
