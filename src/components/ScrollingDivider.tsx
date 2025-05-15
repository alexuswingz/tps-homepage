"use client";
import { useEffect, useState } from 'react';

interface ScrollingDividerProps {
  className?: string;
}

const ScrollingDivider = ({ className = "" }: ScrollingDividerProps) => {
  const items = [
    "SIMPLE FORMULAS",
    "1 MILLION GROWERS SERVED",
    "FUN AND EASY",
    "15,000 FIVE STAR REVIEWS",
    "10 YEARS MEETINGS CUSTOMERS NEEDS"
  ];
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if it's a mobile device
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className={`w-full bg-[#FDF6EF] ${className}`}>
      {/* First line - scrolling left */}
      <div className="border-y border-gray-200 overflow-hidden whitespace-nowrap py-2 sm:py-4">
        <div 
          className={isMobile ? 'inline-flex animate-marquee-mobile' : 'inline-flex animate-marquee'} 
          style={{ width: "200%", position: "relative" }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center">
              {items.map((item, index) => (
                <span key={`${i}-${index}`} className="flex items-center mx-3 sm:mx-8">
                  <img 
                    src="/assets/leaf-gif.gif" 
                    alt="leaf bullet" 
                    className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2 sm:mr-3"
                  />
                  <span className="text-sm sm:text-base md:text-lg font-semibold">{item}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Second line - scrolling right */}
      <div className="border-b border-gray-200 overflow-hidden whitespace-nowrap py-2 sm:py-4">
        <div 
          className={isMobile ? 'inline-flex animate-marquee-reverse-mobile' : 'inline-flex animate-marquee-reverse'} 
          style={{ width: "200%", position: "relative" }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center">
              {items.map((item, index) => (
                <span key={`${i}-${index}`} className="flex items-center mx-3 sm:mx-8">
                  <img 
                    src="/assets/leaf-gif.gif" 
                    alt="leaf bullet" 
                    className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2 sm:mr-3"
                  />
                  <span className="text-sm sm:text-base md:text-lg font-semibold">{item}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingDivider; 