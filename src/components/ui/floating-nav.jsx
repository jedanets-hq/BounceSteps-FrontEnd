"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const FloatingNav = ({ items, activeId, onChange, className = "", style = {} }) => {
  // Find the index of the currently active tab
  const activeIndex = items?.findIndex(item => item.id === activeId);
  const active = activeIndex !== -1 ? activeIndex : 0;

  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef(null);
  const btnRefs = useRef([]);

  // Update indicator position when active changes or resize
  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[active] && containerRef.current) {
        const btn = btnRefs.current[active];
        const container = containerRef.current;
        if (!btn) return;

        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate relative position inside the scrollable container
        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left + container.scrollLeft,
        });

        // Ensure the active button is visible in the scrollable view
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    };

    // Small timeout to allow render to complete
    const timer = setTimeout(updateIndicator, 50);
    
    window.addEventListener("resize", updateIndicator);
    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updateIndicator);
    }
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateIndicator);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", updateIndicator);
      }
    };
  }, [active, items?.length]);

  return (
    <div className={`z-50 w-full max-w-2xl px-2 ${className}`} style={style}>
      <div
        ref={containerRef}
        className="relative flex flex-row items-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-xl rounded-full px-1 py-1.5 border border-gray-200/50 dark:border-gray-800/50 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />

        {items.map((item, index) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => (btnRefs.current[index] = el)}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center min-w-[4rem] sm:min-w-[4.5rem] flex-1 px-2 py-2 text-sm font-medium transition-colors"
            >
              <div className={`z-10 ${isActive ? "text-primary font-bold dark:text-primary-foreground" : "text-gray-600 dark:text-gray-300"}`}>
                {item.icon}
              </div>
              {/* Hide labels on extra small screens, show on small and up */}
              <span className={`text-[10px] mt-1 hidden sm:block truncate w-full text-center z-10 ${isActive ? "text-primary font-bold dark:text-primary-foreground" : "text-gray-600 dark:text-gray-300"}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Sliding Active Indicator */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-1 bottom-1 rounded-full bg-primary/10 dark:bg-primary/20 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default FloatingNav;
