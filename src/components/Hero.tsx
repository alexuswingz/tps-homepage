"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollingDivider from "./ScrollingDivider";

const Hero = () => {
  return (
    <>
      <div className="bg-[#FDF6EF] w-full px-2 sm:px-6 py-4 sm:py-6 pb-0">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-visible min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] relative">
            {/* Left Section - 100% on mobile, 70% on desktop */}
            <div className="relative w-full lg:w-[70%] flex flex-col justify-end pb-12 sm:pb-16 lg:pb-16 px-4 sm:px-8 lg:pl-16 bg-gray-900 rounded-3xl lg:rounded-l-3xl lg:rounded-tr-none overflow-hidden min-h-[400px] sm:min-h-[450px]">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 z-[1]"></div>
              
              <div className="relative z-10 max-w-[600px]">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-3 sm:mb-4 leading-tight text-white">
                  Grow something beautiful.
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl mb-5 sm:mb-6 lg:mb-8 text-white/95">
                  Give your plants everything they need.
                </p>
                <Link 
                  href="/shop/"
                  className="bg-[#FF6B6B] text-white px-8 sm:px-10 lg:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-semibold inline-block hover:bg-[#ff5252] transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Shop Now
                </Link>
              </div>
              <Image
                src="/assets/woman-holding-plants.jpg"
                alt="Woman holding plants"
                fill
                className="object-cover object-[center_20%] sm:object-center z-0"
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>

            {/* Right Section - Hidden on mobile, 30% on desktop */}
            <div className="hidden lg:flex relative w-full lg:w-[30%] h-[300px] sm:h-[350px] lg:h-auto bg-[#00C9B0] items-center justify-center rounded-r-3xl overflow-visible">
              <Link 
                href="/build-a-bundle/" 
                className="absolute transform lg:left-[-25%] w-[593px] h-[593px] scale-110 transition-transform duration-500 ease-out hover:scale-[1.15] cursor-pointer z-20"
              >
                <Image
                  src="/assets/productwithleaf.png"
                  alt="TPS Indoor Plant Food with decorative leaves"
                  fill
                  className="object-contain z-20"
                  priority
                  sizes="(max-width: 1024px) 350px, 593px"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ScrollingDivider />
    </>
  );
};

export default Hero; 