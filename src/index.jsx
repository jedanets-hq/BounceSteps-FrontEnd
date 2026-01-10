import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Import fetch wrapper to handle API URLs globally
import "./utils/fetch-wrapper";

// Clear old caches on app startup to ensure fresh version
const clearOldCaches = async () => {
  try {
    // Clear all browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🧹 Cleared browser caches');
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      if (registrations.length > 0) {
        console.log('🧹 Unregistered service workers');
      }
    }
  } catch (e) {
    console.warn('Cache clearing failed:', e);
  }
};

// Run cache clearing on startup
clearOldCaches();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
