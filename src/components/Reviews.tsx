"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';
// Import required modules
import { Pagination, Navigation, Autoplay, EffectCards } from 'swiper/modules';

const reviews = [
  {
    personImage: "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
    personInitial: "J",
    productName: "Monstera Plant Food",
    bgColor: "#83C176", // Green
    text: "I've used a lot of different fertilizers over the years, but this is hands down the best for my monstera. Within 3 weeks of the first application, I got TWO new leaves! My plant was struggling before, but now it's absolutely thriving. The bottle is well-designed and the instructions are clear.",
    quote: "My monstera is thriving!",
    stars: 5,
    reviewer: "Jennifer S.",
    reviewLink: "https://www.amazon.com/Monstera-Monsteras-Philodendrons-Houseplant-Fertilizer/dp/B0BRTK1P8Z/",
    date: "March 15, 2023"
  },
  {
    personImage: "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
    personInitial: "M",
    productName: "Monstera Plant Food",
    bgColor: "#FF6B6B", // Pink/Red
    text: "I was skeptical at first because I've tried so many products for my monstera, but the difference is remarkable. New growth appeared within days, and the leaves are bigger and have more fenestrations than ever before. Even my oldest plant has perked up considerably. Worth every penny!",
    quote: "Bigger leaves with more splits!",
    stars: 5,
    reviewer: "Mike R.",
    reviewLink: "https://www.amazon.com/Monstera-Monsteras-Philodendrons-Houseplant-Fertilizer/dp/B0BRTK1P8Z/",
    date: "February 22, 2023"
  },
  {
    personImage: "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
    personInitial: "S",
    productName: "Monstera Plant Food",
    bgColor: "#5D9CEC", // Blue
    text: "After using this fertilizer for about 2 months, my monstera has exploded with growth. I follow the directions exactly - diluting as recommended and applying every 2 weeks. The leaves are darker green and so much healthier looking. Will definitely purchase again when I run out!",
    quote: "Incredible growth results",
    stars: 5,
    reviewer: "Samantha K.",
    reviewLink: "https://www.amazon.com/Monstera-Monsteras-Philodendrons-Houseplant-Fertilizer/dp/B0BRTK1P8Z/",
    date: "April 3, 2023"
  },
  {
    personImage: "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
    personInitial: "A",
    productName: "Monstera Plant Food",
    bgColor: "#AC92EC", // Purple
    text: "I've been using this on all of my philodendrons, not just my monstera, and I'm getting fantastic results across the board. The packaging is great, delivery was quick, and most importantly, it works! No burn, no smell, just happy plants. I'll be trying their other formulas too.",
    quote: "Works on all my philodendrons!",
    stars: 5,
    reviewer: "Alex M.",
    reviewLink: "https://www.amazon.com/Monstera-Monsteras-Philodendrons-Houseplant-Fertilizer/dp/B0BRTK1P8Z/",
    date: "January 18, 2023"
  },
  {
    personImage: "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
    personInitial: "O",
    productName: "Monstera Plant Food",
    bgColor: "#FFCE54", // Yellow
    text: "This is my second bottle. I've been using it for about 6 months and my plant has never been healthier. I was nervous about using fertilizer because I've burned plants in the past, but this formula is gentle yet effective. My monstera has put out 4 new leaves in 2 months!",
    quote: "Perfect for beginners and experts alike",
    stars: 5,
    reviewer: "Olivia T.",
    reviewLink: "https://www.amazon.com/Monstera-Monsteras-Philodendrons-Houseplant-Fertilizer/dp/B0BRTK1P8Z/",
    date: "May 7, 2023"
  },
  {
    personImage: "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
    personInitial: "C",
    productName: "Monstera Plant Food",
    bgColor: "#ED5565", // Darker Red
    text: "I was ready to give up on my struggling monstera until I tried this fertilizer. After just 3 applications (following the schedule on the bottle), my plant is pushing out new growth and the older leaves have perked up. It's like it's a completely different plant! Highly recommend.",
    quote: "Saved my dying monstera!",
    stars: 5,
    reviewer: "Carlos P.",
    reviewLink: "https://www.amazon.com/Monstera-Monsteras-Philodendrons-Houseplant-Fertilizer/dp/B0BRTK1P8Z/",
    date: "March 28, 2023"
  }
];

const Reviews = () => {
  return (
    <section className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center text-[#FF6B6B] mb-4">
          TPS. Regrettable Name. Great Reviews!
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">15,000+ Five-Star Reviews from Happy Plant Owners</p>

        {/* Desktop Version - Visible on md and up */}
        <div className="hidden md:block relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={true}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
              }
            }}
            className="reviews-swiper"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <Link 
                  href={review.reviewLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <div 
                    className="bg-white rounded-[32px] overflow-hidden shadow-xl h-full flex flex-col transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                    style={{ borderTop: `8px solid ${review.bgColor}` }}
                  >
                    <div className="p-6 pt-8 flex-grow flex flex-col">
                      {/* Reviewer Image */}
                      <div className="relative w-20 h-20 mb-4 mx-auto">
                        <div className="rounded-full overflow-hidden border-4 bg-gray-100 flex items-center justify-center" style={{ borderColor: review.bgColor }}>
                          {review.personImage ? (
                            <Image
                              src={review.personImage}
                              alt={review.reviewer}
                              width={80}
                              height={80}
                              className="object-cover"
                              priority={index < 3}
                            />
                          ) : (
                            <span className="text-2xl font-bold text-gray-500">{review.personInitial}</span>
                          )}
                        </div>
                      </div>

                      {/* Reviewer Name */}
                      <p className="text-center font-medium text-gray-800 mb-2">
                        {review.reviewer}
                      </p>
                      
                      {/* Verified Purchase Badge */}
                      <div className="flex justify-center mb-4">
                        <span className="text-xs font-medium text-[#FF6B6B] bg-[#FDF6EF] px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 mb-4 relative flex-grow">
                        {/* Star Rating */}
                        <div className="flex justify-center gap-1 mb-3">
                          {[...Array(review.stars)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      
                        {/* Quote */}
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-3 line-clamp-2">
                          "{review.quote}"
                        </h3>

                        {/* Review Text */}
                        <p className="text-gray-600 line-clamp-4">
                          {review.text}
                        </p>
                        
                        {/* Product Label */}
                        <div className="mt-4 text-center">
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: review.bgColor, color: 'white' }}>
                            {review.productName}
                          </span>
                        </div>
                      </div>

                      {/* Review Date */}
                      <p className="text-center text-xs text-gray-400">
                        Reviewed on {review.date}
                      </p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Mobile Version with Card Effect - Visible only on small screens */}
        <div className="md:hidden">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards, Pagination]}
            className="reviews-cards-swiper"
            pagination={{
              clickable: true,
            }}
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <Link 
                  href={review.reviewLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <div 
                    className="bg-white rounded-[24px] overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
                    style={{ borderLeft: `8px solid ${review.bgColor}` }}
                  >
                    <div className="p-5">
                      {/* Reviewer Image and Name */}
                      <div className="flex items-center mb-3">
                        <div className="relative w-14 h-14 mr-3">
                          <div className="rounded-full overflow-hidden border-2 bg-gray-100 flex items-center justify-center" style={{ borderColor: review.bgColor }}>
                            {review.personImage ? (
                              <Image
                                src={review.personImage}
                                alt={review.reviewer}
                                width={56}
                                height={56}
                                className="object-cover"
                                priority={index < 3}
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-500">{review.personInitial}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{review.reviewer}</p>
                          {/* Verified Badge */}
                          <span className="text-[10px] font-medium text-[#FF6B6B]">
                            Verified Purchase
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-3 mb-2 relative">
                        {/* Star Rating */}
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(review.stars)].map((_, i) => (
                            <svg key={i} className="w-3 h-3 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      
                        {/* Quote */}
                        <h3 className="text-base font-bold text-gray-800 mb-2">
                          "{review.quote}"
                        </h3>

                        {/* Review Text */}
                        <p className="text-xs text-gray-600 line-clamp-4">
                          {review.text}
                        </p>
                        
                        {/* Product Label */}
                        <div className="mt-2 text-center">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ backgroundColor: review.bgColor, color: 'white' }}>
                            {review.productName}
                          </span>
                        </div>
                      </div>
                      
                      {/* Review Date */}
                      <p className="text-right text-[10px] text-gray-400">
                        {review.date}
                      </p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Swiper Custom Styles */}
      <style jsx global>{`
        .reviews-swiper {
          padding: 20px 10px 60px;
          overflow: visible;
        }
        
        .reviews-swiper .swiper-pagination {
          bottom: 0;
        }
        
        .reviews-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #ddd;
          opacity: 1;
        }
        
        .reviews-swiper .swiper-pagination-bullet-active {
          background: #FF6B6B;
          width: 24px;
          border-radius: 5px;
        }
        
        .reviews-swiper .swiper-button-next,
        .reviews-swiper .swiper-button-prev {
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .reviews-swiper .swiper-button-next:after,
        .reviews-swiper .swiper-button-prev:after {
          font-size: 16px;
          color: #333;
          font-weight: bold;
        }
        
        .reviews-cards-swiper {
          width: 300px;
          height: 420px;
          margin: 0 auto;
          padding-bottom: 40px;
        }
        
        .reviews-cards-swiper .swiper-slide {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </section>
  );
};

export default Reviews; 