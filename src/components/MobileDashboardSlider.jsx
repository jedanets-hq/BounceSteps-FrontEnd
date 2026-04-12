import React, { useState, useRef, useEffect } from 'react';
import Icon from './AppIcon';

const MobileDashboardSlider = ({ activeTab, onTabChange, tabs, className = '' }) => {
  const scrollRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // Check scroll position to show/hide fade effects
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftFade(scrollLeft > 0);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    if (scrollRef.current && activeTab) {
      const activeElement = scrollRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    onTabChange(tab.id);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left fade effect */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Right fade effect */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-2"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full
                transition-all duration-200 ease-out
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }
                active:scale-95 touch-manipulation
              `}
              style={{ minWidth: 'fit-content' }}
            >
              <Icon name={tab.icon} size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileDashboardSlider;