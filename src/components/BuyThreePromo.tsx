"use client";

import Image from 'next/image';
import Link from 'next/link';

const BuyThreePromo = () => {
  return (
    <section className="w-full bg-[#F2FAE8] py-8 sm:py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-[32px] sm:text-[42px] leading-[1.1] font-bold mb-1">
              Just getting <span className="text-[#FF6B6B]">started?</span>
            </h2>
            <p className="text-sm sm:text-lg text-gray-700">
              Try a popular bundle, or build your own!
            </p>
          </div>
          
          <div className="relative w-full mb-6 sm:mb-8">
            {/* Mobile scrolling view */}
            <div className="flex md:hidden overflow-x-auto scrollbar-hide pb-4 snap-x">
              <div className="flex gap-3 px-2 w-full">
                {/* New Growth Pack */}
                <div className="min-w-[240px] max-w-[240px] bg-[#E0F7FA] rounded-2xl overflow-hidden p-3 flex-shrink-0 snap-start">
                  <div className="relative h-[120px] mb-2 bg-[#E0F7FA]">
                    <Image
                      src="/assets/newgrowth.png"
                      alt="New Growth Starter Pack"
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="240px"
                      priority
                    />
                  </div>
                  <h3 className="text-sm font-bold uppercase mb-0.5">NEW GROWTH</h3>
                  <h4 className="text-xs font-medium uppercase mb-1">STARTER PACK</h4>
                  <p className="text-xs text-gray-700 mb-2 min-h-[40px] leading-tight">
                    Nurture new sprouts, promote sturdy growth, and improve overall plant health.
                  </p>
                  <Link 
                    href="/shop/new-growth"
                    className="inline-block bg-[#FF6B6B] text-white w-full py-2 rounded-full text-xs font-medium hover:bg-opacity-90 transition-colors text-center"
                  >
                    SHOP - <span className="line-through">$49</span> $38
                  </Link>
                </div>
                
                {/* Indoor Tropical Pack */}
                <div className="min-w-[240px] max-w-[240px] bg-[#E8F8E8] rounded-2xl overflow-hidden p-3 flex-shrink-0 snap-start">
                  <div className="relative h-[120px] mb-2 bg-[#E8F8E8]">
                    <Image
                      src="/assets/starterpack.png"
                      alt="Indoor Tropical Starter Pack"
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="240px"
                    />
                  </div>
                  <h3 className="text-sm font-bold uppercase mb-0.5">INDOOR TROPICAL</h3>
                  <h4 className="text-xs font-medium uppercase mb-1">STARTER PACK</h4>
                  <p className="text-xs text-gray-700 mb-2 min-h-[40px] leading-tight">
                    Boost lush growth, fortify stems, and promote vibrant, thriving tropical plants.
                  </p>
                  <Link 
                    href="/shop/indoor-tropical"
                    className="inline-block bg-[#FF6B6B] text-white w-full py-2 rounded-full text-xs font-medium hover:bg-opacity-90 transition-colors text-center"
                  >
                    SHOP - <span className="line-through">$45</span> $35
                  </Link>
                </div>
                
                {/* Outdoor Trees Bundle */}
                <div className="min-w-[240px] max-w-[240px] bg-[#F7F3D9] rounded-2xl overflow-hidden p-3 flex-shrink-0 snap-start">
                  <div className="relative h-[120px] mb-2 bg-[#F7F3D9]">
                    <Image
                      src="/assets/bundle.png"
                      alt="Outdoor Trees Bundle"
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="240px"
                    />
                  </div>
                  <h3 className="text-sm font-bold uppercase mb-0.5">OUTDOOR TREES</h3>
                  <h4 className="text-xs font-medium uppercase mb-1">BUNDLE</h4>
                  <p className="text-xs text-gray-700 mb-2 min-h-[40px] leading-tight">
                    Encourage deep-root development, strong branches, and resilient, healthy trees.
                  </p>
                  <Link 
                    href="/shop/outdoor-trees"
                    className="inline-block bg-[#FF6B6B] text-white w-full py-2 rounded-full text-xs font-medium hover:bg-opacity-90 transition-colors text-center"
                  >
                    SHOP - <span className="line-through">$49</span> $38
                  </Link>
                </div>
                 
                {/* "See All" link card for mobile */}
                <div className="min-w-[100px] bg-transparent flex-shrink-0 snap-start flex items-center justify-center">
                  <Link 
                    href="/shop/variety-packs"
                    className="flex flex-col items-center text-gray-600 hover:text-gray-900"
                  >
                    <div className="flex flex-col items-center mb-1">
                      <span className="text-xs font-medium whitespace-nowrap">SEE ALL</span>
                      <span className="text-[10px] whitespace-nowrap">VARIETY PACKS</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M5 7l5 5-5 5" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Desktop grid view */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* New Growth Pack */}
              <div className="bg-[#E0F7FA] rounded-3xl overflow-hidden p-4">
                <div className="relative h-48 mb-4 bg-[#E0F7FA]">
                  <Image
                    src="/assets/newgrowth.png"
                    alt="New Growth Starter Pack"
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    priority
                  />
                </div>
                <h3 className="text-lg font-bold uppercase mb-1">NEW GROWTH</h3>
                <h4 className="text-base font-medium uppercase mb-2">STARTER PACK</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Nurture new sprouts, promote sturdy growth, and improve overall plant health.
                </p>
                <Link 
                  href="/shop/new-growth"
                  className="inline-block bg-[#FF6B6B] text-white w-full py-3 rounded-full text-base font-medium hover:bg-opacity-90 transition-colors text-center"
                >
                  SHOP - <span className="line-through">$49</span> $38
                </Link>
              </div>
              
              {/* Indoor Tropical Pack */}
              <div className="bg-[#E8F8E8] rounded-3xl overflow-hidden p-4">
                <div className="relative h-48 mb-4 bg-[#E8F8E8]">
                  <Image
                    src="/assets/starterpack.png"
                    alt="Indoor Tropical Starter Pack"
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <h3 className="text-lg font-bold uppercase mb-1">INDOOR TROPICAL</h3>
                <h4 className="text-base font-medium uppercase mb-2">STARTER PACK</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Boost lush growth, fortify stems, and promote vibrant, thriving tropical plants.
                </p>
                <Link 
                  href="/shop/indoor-tropical"
                  className="inline-block bg-[#FF6B6B] text-white w-full py-3 rounded-full text-base font-medium hover:bg-opacity-90 transition-colors text-center"
                >
                  SHOP - <span className="line-through">$45</span> $35
                </Link>
              </div>
              
              {/* Outdoor Trees Bundle */}
              <div className="bg-[#F7F3D9] rounded-3xl overflow-hidden p-4">
                <div className="relative h-48 mb-4 bg-[#F7F3D9]">
                  <Image
                    src="/assets/bundle.png"
                    alt="Outdoor Trees Bundle"
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <h3 className="text-lg font-bold uppercase mb-1">OUTDOOR TREES</h3>
                <h4 className="text-base font-medium uppercase mb-2">BUNDLE</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Encourage deep-root development, strong branches, and resilient, healthy trees.
                </p>
                <Link 
                  href="/shop/outdoor-trees"
                  className="inline-block bg-[#FF6B6B] text-white w-full py-3 rounded-full text-base font-medium hover:bg-opacity-90 transition-colors text-center"
                >
                  SHOP - <span className="line-through">$49</span> $38
                </Link>
              </div>
              
              {/* Flower Garden Pack - Hidden on smaller screens */}
              <div className="hidden lg:block bg-[#F1E8FA] rounded-3xl overflow-hidden p-4">
                <div className="relative h-48 mb-4 bg-[#F1E8FA]">
                  <Image
                    src="/assets/propack.png"
                    alt="Flower Garden Pro Pack"
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="(min-width: 1024px) 25vw, 100vw"
                  />
                </div>
                <h3 className="text-lg font-bold uppercase mb-1">FLOWER GARDEN</h3>
                <h4 className="text-base font-medium uppercase mb-2">PRO PACK</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Support blooms, strengthen stems, and enhance the vibrancy of your flowers.
                </p>
                <Link 
                  href="/shop/flower-garden"
                  className="inline-block bg-[#FF6B6B] text-white w-full py-3 rounded-full text-base font-medium hover:bg-opacity-90 transition-colors text-center"
                >
                  SHOP - <span className="line-through">$45</span> $35
                </Link>
              </div>
            </div>
          </div>
          
          <Link 
            href="/build-bundle"
            className="inline-block bg-[#FF6B6B] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-opacity-90 transition-colors text-center"
          >
            BUILD YOUR OWN
          </Link>
        </div>
      </div>
      
      {/* Mobile-specific styling */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default BuyThreePromo; 