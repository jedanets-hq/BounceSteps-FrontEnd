import React from 'react';
import { Award, Star, Leaf, MapPin } from 'lucide-react';

/**
 * ProviderBadge Component
 * Displays different types of provider badges with appropriate styling
 * 
 * VERIFIED BADGE: Uses Instagram-style blue starburst with white checkmark
 */
const ProviderBadge = ({ badgeType, size = 'md', showText = true, className = '' }) => {
  if (!badgeType) return null;

  // Size configurations
  const sizes = {
    xs: { badge: 16, icon: 14, text: 'text-xs', padding: 'px-2 py-0.5', gap: 'gap-1' },
    sm: { badge: 20, icon: 16, text: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1.5' },
    md: { badge: 24, icon: 18, text: 'text-sm', padding: 'px-3 py-1', gap: 'gap-1.5' },
    lg: { badge: 28, icon: 20, text: 'text-base', padding: 'px-3 py-1.5', gap: 'gap-2' },
    xl: { badge: 32, icon: 24, text: 'text-lg', padding: 'px-4 py-2', gap: 'gap-2' }
  };

  const currentSize = sizes[size] || sizes.md;

  // Special handling for VERIFIED badge - uses starburst shape
  if (badgeType === 'verified') {
    return (
      <div 
        className={`inline-flex items-center ${currentSize.gap} ${className}`}
        title="Identity Verified Provider"
      >
        {/* Instagram-style Blue Starburst with White Checkmark */}
        <div 
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ width: currentSize.badge, height: currentSize.badge }}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: currentSize.badge, height: currentSize.badge }}
          >
            {/* Blue Starburst/Seal Shape - 12 points */}
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
          <span className={`font-semibold text-blue-600 ${currentSize.text}`}>
            Verified
          </span>
        )}
      </div>
    );
  }

  // Badge configurations for other badge types
  const badgeConfig = {
    premium: {
      label: 'Premium',
      icon: Award,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-600',
      description: 'Premium Service Provider'
    },
    top_rated: {
      label: 'Top Rated',
      icon: Star,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      description: 'Highly Rated by Travelers'
    },
    eco_friendly: {
      label: 'Eco Friendly',
      icon: Leaf,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      description: 'Environmentally Conscious'
    },
    local_expert: {
      label: 'Local Expert',
      icon: MapPin,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      description: 'Local Area Specialist'
    }
  };

  const config = badgeConfig[badgeType];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center ${currentSize.gap} ${currentSize.padding} ${config.bgColor} ${config.textColor} rounded-full font-medium ${className}`}
      title={config.description}
    >
      <Icon size={currentSize.icon} className={config.iconColor} />
      {showText && (
        <span className={currentSize.text}>{config.label}</span>
      )}
    </div>
  );
};

/**
 * ProviderBadgeList Component
 * Displays multiple badges in a row
 */
export const ProviderBadgeList = ({ badges = [], size = 'md', showText = true, className = '' }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge, index) => (
        <ProviderBadge 
          key={index} 
          badgeType={badge} 
          size={size} 
          showText={showText} 
        />
      ))}
    </div>
  );
};

/**
 * ProviderBadgeIcon Component
 * Just the icon without background (for compact display)
 */
export const ProviderBadgeIcon = ({ badgeType, size = 20, className = '' }) => {
  if (!badgeType) return null;

  // Special handling for verified badge - starburst icon
  if (badgeType === 'verified') {
    return (
      <div 
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: size, height: size }}
        >
          <path 
            d="M12 1.5L13.5 4.5L16.5 3L16.5 6.5L20 6L18.5 9L21.5 11L18.5 13L20 16L16.5 15.5L16.5 19L13.5 17.5L12 20.5L10.5 17.5L7.5 19L7.5 15.5L4 16L5.5 13L2.5 11L5.5 9L4 6L7.5 6.5L7.5 3L10.5 4.5L12 1.5Z" 
            fill="#1DA1F2"
          />
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
    );
  }

  const badgeConfig = {
    premium: { icon: Award, color: 'text-yellow-600' },
    top_rated: { icon: Star, color: 'text-yellow-600' },
    eco_friendly: { icon: Leaf, color: 'text-green-600' },
    local_expert: { icon: MapPin, color: 'text-orange-600' }
  };

  const config = badgeConfig[badgeType];
  if (!config) return null;

  const Icon = config.icon;

  return <Icon size={size} className={`${config.color} ${className}`} />;
};

export default ProviderBadge;
