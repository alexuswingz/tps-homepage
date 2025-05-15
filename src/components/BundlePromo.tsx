"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, EffectCoverflow } from 'swiper/modules';
import type { Product } from '@/types/shopify';
import { getRecommendedAddons } from '@/lib/shopify';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';
import 'swiper/css/effect-coverflow';

const BundlePromo = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [domLoaded, setDomLoaded] = useState(false);

  // Fetch products from Shopify
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Get up to 12 products for the carousel
        const productData = await getRecommendedAddons(12);
        if (productData && productData.length > 0) {
          setProducts(productData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Set domLoaded to true after component is mounted
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  // Duplicate products array to ensure continuous scrolling
  const allProducts = [...products, ...products, ...products];

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full transform hover:scale-[1.02]">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText || product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/buy.png'; // Fallback image
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="font-semibold text-[#4A3520] mb-1 line-clamp-1 group-hover:text-[#F33A6A] transition-colors duration-300">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 h-10">
          {product.description.replace(/<[^>]*>?/gm, '')}
        </p>
      </div>
    </div>
  );

  // Skeleton loader for products while loading
  const ProductSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
      <div className="relative aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );

  return (
    <section className="bg-gradient-to-b from-[#FDF6EF] to-[#FFF8F0] py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#FAECD8] to-[#FEF1E1] rounded-3xl overflow-hidden p-8 md:p-12 shadow-xl">
          <div className="text-center mb-10">
            <div className="bg-gradient-to-r from-[#FF6B6B] to-[#F33A6A] text-white inline-block px-5 py-1.5 rounded-full text-sm font-semibold mb-4 shadow-sm">
              SAVE $10
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A3520] drop-shadow-sm">
              Bundle Your Plant Foods
            </h2>
            <p className="text-[#83735A] mb-8 max-w-2xl mx-auto leading-relaxed">
              Create the perfect trio for your plants! Choose any 3 bottles from our selection 
              and save $10 instantly. Mix and match to give your plant family exactly what they need.
            </p>
          </div>
          
          {/* Product carousel */}
          {domLoaded && (
            <div className="overflow-hidden mb-10">
              {isLoading || products.length === 0 ? (
                // Show skeleton loaders while fetching products
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <Swiper
                  modules={[Autoplay, FreeMode, EffectCoverflow]}
                  effect={'coverflow'}
                  grabCursor={true}
                  centeredSlides={false}
                  coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: false,
                  }}
                  spaceBetween={16}
                  slidesPerView={2}
                  speed={8000}
                  autoplay={{
                    delay: 0,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  freeMode={{
                    enabled: true,
                    minimumVelocity: 0.02,
                    momentum: false
                  }}
                  breakpoints={{
                    480: { slidesPerView: 3, spaceBetween: 16 },
                    640: { slidesPerView: 4, spaceBetween: 16 },
                    768: { slidesPerView: 5, spaceBetween: 16 },
                    1024: { slidesPerView: 6, spaceBetween: 16 },
                    1280: { slidesPerView: 7, spaceBetween: 16 }
                  }}
                  className="pb-5"
                >
                  {allProducts.map((product, index) => (
                    <SwiperSlide key={`${product.id}-${index}`}>
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          )}
          
          <div className="text-center">
            <Link 
              href="/build-a-bundle" 
              className="relative inline-flex group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF3373] rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
              <button className="relative bg-[#F33A6A] text-white py-4 px-10 rounded-full font-bold shadow-md transition-all duration-300 group-hover:shadow-lg">
                BUILD YOUR BUNDLE
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BundlePromo; 