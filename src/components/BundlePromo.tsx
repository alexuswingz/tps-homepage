"use client";

import Image from 'next/image';
import Link from 'next/link';

const BundlePromo = () => {
  return (
    <section className="bg-[#FDF6EF] py-16">
      <div className="container mx-auto px-4">
        <div className="bg-[#FAECD8] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side - Image */}
            <div className="relative h-[300px] md:h-auto">
              <Image
                src="/assets/buy.png"
                alt="Build your bundle of plant food"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Right side - Content */}
            <div className="p-8 flex flex-col justify-center">
              <div className="bg-[#FF6B6B] text-white inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4">
                SAVE $10
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[#4A3520]">Your Bundle</h2>
              <p className="text-[#83735A] mb-6">
                Make a Bundle of 3!
                Mix and match any of our plant foods to create the perfect bundle for your plants. 
                Choose 3 bottles and save $10 instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#83735A] text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-[#4A3520] font-medium">Select 3 products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#83735A] text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-[#4A3520] font-medium">Add to cart</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#83735A] text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-[#4A3520] font-medium">Save $10!</span>
                </div>
              </div>
              <div className="rounded-full border border-[#D9D0BA] bg-white py-3 px-4 text-center mb-6">
                <span className="font-semibold">0/3 SELECTED</span>
              </div>
              <Link 
                href="/build-a-bundle" 
                className="bg-[#F33A6A] hover:bg-[#e02d5d] text-white text-center py-3 px-8 rounded-full font-bold transition-colors shadow-sm hover:shadow-md"
              >
                BUILD YOUR BUNDLE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BundlePromo; 