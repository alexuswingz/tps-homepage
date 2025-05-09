"use client";

import Image from 'next/image';
import { useState } from 'react';

const reviews = [
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    text: "This fertilizer specially formulated to support lush growth, vibrant leaves, & strong roots for your tropical indoor plants. I will be buying again!",
    quote: "I LOVE this product!"
  },
  {
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    text: "This fertilizer specially formulated to support lush growth, vibrant leaves, & strong roots for your tropical indoor plants. I will be buying again!",
    quote: "I LOVE this product!"
  },
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    text: "This fertilizer specially formulated to support lush growth, vibrant leaves, & strong roots for your tropical indoor plants. I will be buying again!",
    quote: "I LOVE this product!"
  }
];

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center text-[#FF6B6B] mb-12">
          TPS. Regrettable Name. Great Reviews!
        </h2>

        <div className="flex items-center justify-center gap-6">
          {/* Previous Button */}
          <button 
            onClick={prevSlide}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
            aria-label="Previous review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {[-1, 0, 1].map((offset) => {
              const index = (currentIndex + offset + reviews.length) % reviews.length;
              return (
                <div 
                  key={index}
                  className={`bg-white rounded-[40px] p-6 shadow-lg transform transition-all duration-500 ${
                    offset === 0 ? 'md:scale-105 md:shadow-xl' : 'md:scale-95 opacity-70'
                  } ${offset !== 0 ? 'hidden md:block' : ''}`}
                >
                  {/* Review Image */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="rounded-full overflow-hidden">
                      <Image
                        src={reviews[index].image}
                        alt="Customer review"
                        width={192}
                        height={192}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-6 h-6 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    {reviews[index].quote}
                  </h3>

                  {/* Review Text */}
                  <p className="text-center text-gray-600 leading-relaxed">
                    {reviews[index].text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
            aria-label="Next review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === index ? 'bg-[#FF6B6B]' : 'bg-gray-300'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews; 