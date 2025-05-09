"use client";

import Image from 'next/image';
import Link from 'next/link';

const BuyThreePromo = () => {
  return (
    <section className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-[#FF6B6B] rounded-[40px] overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left side - Text content */}
            <div className="w-full lg:w-1/2 p-6 lg:p-12 text-white">
              <h2 className="text-[42px] leading-[1.1] font-bold mb-4">
                Save $10 When<br />
                You Buy 3
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Create something special by mixing and<br />
                matching your favorites!
              </p>
              <Link 
                href="/build-bundle"
                className="inline-block bg-[#F8F0E7] text-[#FF6B6B] px-8 py-3 rounded-full text-base font-medium hover:bg-opacity-90 transition-colors"
              >
                BUILD A BUNDLE
              </Link>
            </div>

            {/* Right side - Image */}
            <div className="w-full lg:w-1/2 p-6">
              <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden">
                <Image
                  src="/assets/buy3.png"
                  alt="TPS Plant Food bottles collection"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyThreePromo; 