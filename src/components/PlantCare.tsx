"use client";

import Image from 'next/image';
import Link from 'next/link';

const PlantCare = () => {
  return (
    <section className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-16">
          {/* Left side - Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[4/5] sm:aspect-square rounded-[24px] sm:rounded-[40px] overflow-hidden">
              <Image
                src="/assets/bannerwithhand2.png"
                alt="Hand holding TPS Plant Food bottle with Monstera plant"
                fill
                className="object-contain object-center"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 700px"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Clean, effective formulas.
              <br className="hidden sm:block" />
              Plant-Based Instructions.
              <br className="hidden sm:block" />
              <span className="text-[#FF6B6B]">Plant care for all!</span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-[500px] mx-auto lg:mx-0">
              Every bottle of TPS Plant Foods is specificlly curated to YOUR plant, so you don't have to guess what your plant needs.
            </p>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-[#8B7355] mb-4 sm:mb-6">OUR MISSION</h3>
              <ul className="space-y-3 sm:space-y-4 max-w-[400px] mx-auto lg:mx-0">
                {[
                  'Simplify plant care.',
                  'Support all growers.',
                  'Grow more plants.'
                ].map((mission, index) => (
                  <li key={index} className="flex items-center text-base sm:text-lg lg:text-xl font-medium text-gray-800">
                    <Image 
                      src="/assets/leaf.png"
                      alt="Leaf icon"
                      width={20}
                      height={20}
                      className="mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                    />
                    {mission}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link 
                href="/category/houseplants/"
                className="bg-[#FF6B6B] text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-medium hover:bg-[#ff5252] transition-colors w-full sm:w-auto text-center"
              >
                SHOP INDOOR
              </Link>
              <Link 
                href="/category/garden-plants/"
                className="bg-[#8B7355] text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-medium hover:bg-[#7A6548] transition-colors w-full sm:w-auto text-center"
              >
                SHOP LAWN & GARDEN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlantCare; 