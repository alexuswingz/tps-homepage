"use client";
import { useEffect, useState } from 'react';

const AnnouncementBanner = () => {
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
    <div className="bg-[#FF6B6B] text-white overflow-hidden whitespace-nowrap py-1 sm:py-2">
      <div className={isMobile ? 'inline-flex animate-marquee-mobile' : 'inline-flex animate-marquee'}>
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-xs sm:text-sm font-medium">
            <span className="mx-2 sm:mx-4">BUY 3 SAVE $10</span>
            <span className="mx-2 sm:mx-4">FREE SHIPPING</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBanner; 