import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// Get build version embedded during build
const LOCAL_VERSION = {
  buildHash: '__BUILD_HASH__',
  buildTime: '__BUILD_TIME__'
};

export default function VersionChecker() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let checkInterval;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const checkVersion = async () => {
      // Don't check if already checking or in development
      if (isChecking || import.meta.env.DEV) return;
      
      setIsChecking(true);

      try {
        // Add timestamp to prevent caching of version.json
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch version');
        }

        const serverVersion = await response.json();
        
        // Log versions for debugging
        console.log('🔍 Version Check:', {
          local: LOCAL_VERSION.buildHash,
          server: serverVersion.buildHash,
          match: LOCAL_VERSION.buildHash === serverVersion.buildHash
        });

        // Compare build hashes
        if (serverVersion.buildHash !== LOCAL_VERSION.buildHash && 
            LOCAL_VERSION.buildHash !== '__BUILD_HASH__') {
          console.log('🆕 New version available!');
          setShowUpdateNotification(true);
        }

        // Reset retry count on success
        retryCount = 0;
      } catch (error) {
        console.error('❌ Version check failed:', error);
        retryCount++;
        
        // Stop checking after max retries
        if (retryCount >= MAX_RETRIES) {
          console.log('⚠️ Stopping version checks after', MAX_RETRIES, 'failures');
          if (checkInterval) {
            clearInterval(checkInterval);
          }
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately on mount
    checkVersion();

    // Check every 5 minutes (300000ms)
    checkInterval = setInterval(checkVersion, 300000);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isChecking]);

  const handleUpdate = () => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Force reload from server
    window.location.reload(true);
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 border border-blue-500">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              🎉 Update Available!
            </h3>
            <p className="text-sm text-blue-100 mb-3">
              A new version of iSafari Global is available. Please update to get the latest features and improvements.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors text-sm"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-blue-800 text-white rounded-md font-medium hover:bg-blue-900 transition-colors text-sm"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}