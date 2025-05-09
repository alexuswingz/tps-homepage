"use client";

const AnnouncementBanner = () => {
  return (
    <div className="bg-[#FF6B6B] text-white overflow-hidden whitespace-nowrap py-1 sm:py-2">
      <div className="inline-flex animate-marquee">
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