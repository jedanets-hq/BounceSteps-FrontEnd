import React from 'react';

/**
 * VerifiedBadge Component
 * Instagram-style verified badge - Blue starburst/seal/rosette shape with white checkmark
 * Design: Scalloped star (starburst) background like Instagram verified badge
 */
const VerifiedBadge = ({ size = 'md', showText = false, className = '' }) => {
  // Size configurations
  const sizes = {
    xs: { badge: 16, text: 'text-xs' },
    sm: { badge: 20, text: 'text-sm' },
    md: { badge: 24, text: 'text-sm' },
    lg: { badge: 32, text: 'text-base' },
    xl: { badge: 40, text: 'text-lg' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Instagram-style Starburst/Seal Badge */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: currentSize.badge, height: currentSize.badge }}
        title="Verified Provider"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: currentSize.badge, height: currentSize.badge }}
        >
          {/* Instagram Blue Starburst/Seal Shape - 12 points scalloped */}
          <path 
            d="M12 1.5L13.5 4.5L16.5 3L16.5 6.5L20 6L18.5 9L21.5 11L18.5 13L20 16L16.5 15.5L16.5 19L13.5 17.5L12 20.5L10.5 17.5L7.5 19L7.5 15.5L4 16L5.5 13L2.5 11L5.5 9L4 6L7.5 6.5L7.5 3L10.5 4.5L12 1.5Z" 
            fill="#1DA1F2"
          />
          
          {/* White checkmark inside - centered */}
          <path 
            d="M8.5 12L10.5 14L15.5 10" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      
      {/* Optional text */}
      {showText && (
        <span className={`font-semibold text-blue-500 ${currentSize.text}`}>
          Verified
        </span>
      )}
    </div>
  );
};

/**
 * Alternative Badge Style - Circle with tick (simpler design)
 */
export const VerifiedBadgeCircle = ({ size = 'md', showText = false, className = '' }) => {
  const sizes = {
    xs: { container: 16, text: 'text-xs' },
    sm: { container: 20, text: 'text-sm' },
    md: { container: 24, text: 'text-sm' },
    lg: { container: 32, text: 'text-base' },
    xl: { container: 40, text: 'text-lg' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center bg-blue-500 rounded-full"
        style={{ width: currentSize.container, height: currentSize.container }}
        title="Verified Provider"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: currentSize.container * 0.6, height: currentSize.container * 0.6 }}
        >
          <path 
            d="M5 12L10 17L19 8" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-semibold text-blue-500 ${currentSize.text}`}>
          Verified
        </span>
      )}
    </div>
  );
};

/**
 * Premium Verified Badge - Instagram-style starburst/seal (recommended)
 * This is the main badge style - Blue starburst with white checkmark
 */
export const VerifiedBadgePremium = ({ size = 'md', showText = false, className = '' }) => {
  const sizes = {
    xs: { badge: 18, text: 'text-xs' },
    sm: { badge: 22, text: 'text-sm' },
    md: { badge: 28, text: 'text-sm' },
    lg: { badge: 36, text: 'text-base' },
    xl: { badge: 44, text: 'text-lg' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        className="relative"
        style={{ width: currentSize.badge, height: currentSize.badge }}
        title="Verified Provider"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: currentSize.badge, height: currentSize.badge }}
        >
          {/* Instagram Blue Starburst/Seal Shape */}
          <path 
            d="M12 1.5L13.5 4.5L16.5 3L16.5 6.5L20 6L18.5 9L21.5 11L18.5 13L20 16L16.5 15.5L16.5 19L13.5 17.5L12 20.5L10.5 17.5L7.5 19L7.5 15.5L4 16L5.5 13L2.5 11L5.5 9L4 6L7.5 6.5L7.5 3L10.5 4.5L12 1.5Z" 
            fill="#1DA1F2"
          />
          
          {/* White checkmark - bold and centered */}
          <path 
            d="M8.5 12L10.5 14L15.5 10" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-semibold text-blue-500 ${currentSize.text}`}>
          Verified
        </span>
      )}
    </div>
  );
};

export default VerifiedBadge;
