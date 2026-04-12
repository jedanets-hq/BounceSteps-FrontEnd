import React, { useState, useRef, useEffect } from 'react';
import Icon from './AppIcon';
import { SERVICE_CATEGORIES } from '../data/serviceCategories';

const MobileCategorySlider = ({ activeCategory, onCategoryChange, className = '' }) => {
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

  // Auto-scroll to active category when it changes
  useEffect(() => {
    if (scrollRef.current && activeCategory) {
      const activeElement = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCategory]);

  const handleCategoryClick = (category) => {
    onCategoryChange(category.id === 'all' ? null : category.id);
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
        {SERVICE_CATEGORIES.map((category) => {
          const isActive = (category.id === 'all' && !activeCategory) || activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              data-category={category.id}
              onClick={() => handleCategoryClick(category)}
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
              <Icon name={category.icon} size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCategorySlider;