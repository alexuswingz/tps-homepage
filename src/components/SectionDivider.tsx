"use client";

import React, { useState, useEffect } from 'react';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';
import Image from 'next/image';

interface SectionDividerProps {
  label?: string;
}

const SectionDivider = ({ label = "Scroll for more" }: SectionDividerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { isInView, ref, scrollToNext } = useScrollAnimations({ 
    threshold: 0.3,
    triggerOnce: false
  });

  // Reset the click state after animation completes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isClicked) {
      timeout = setTimeout(() => {
        setIsClicked(false);
      }, 1000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isClicked]);

  const handleClick = () => {
    setIsClicked(true);
    scrollToNext();
  };

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6 cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Section divider, click to scroll to next section: ${label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Main divider lines with minimalist design */}
        <div className="w-full flex items-center">
          {/* Left line */}
          <div 
            className={`flex-1 h-[1px] sm:h-[1.5px] bg-[#8B7355] transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-70'
            }`}
            style={{
              boxShadow: isHovered ? '0 0 3px rgba(139, 115, 85, 0.7)' : 'none'
            }}
          />
          
          {/* Tiny leaf icon */}
          <div className="mx-2 sm:mx-3 relative">
            <div 
              className={`transition-all duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${
                isClicked ? 'rotate-[360deg]' : isHovered ? 'rotate-[15deg]' : 'rotate-0'
              }`}
              style={{
                transition: 'transform 0.5s ease, rotate 0.8s ease'
              }}
            >
              <div className="relative h-4 w-4">
                <Image
                  src="/assets/leaf.png"
                  alt="TPS Leaf Divider"
                  width={16}
                  height={16}
                  className="object-contain opacity-80"
                />
              </div>
            </div>
          </div>
          
          {/* Right line */}
          <div 
            className={`flex-1 h-[1px] sm:h-[1.5px] bg-[#8B7355] transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-70'
            }`}
            style={{
              boxShadow: isHovered ? '0 0 3px rgba(139, 115, 85, 0.7)' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionDivider; 