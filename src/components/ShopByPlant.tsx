"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { shopifyFetch } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useCartUI } from '@/app/template';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/virtual';
// Import required modules
import { Navigation, Pagination, A11y, Virtual } from 'swiper/modules';

interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

interface Variant {
  id: string;
  title: string;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  quantityAvailable: number;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    url: string;
    altText: string;
  };
  variants: {
    edges: {
      node: Variant;
    }[];
  };
  reviews?: number;
  isBestSeller?: boolean;
  popularityScore?: number;
}

interface ProductCardProps {
  product: Product;
  backgroundColor: string;
}

const ProductCard = ({ product, backgroundColor }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { openCart } = useCartUI();

  useEffect(() => {
    // Safe check for product variants
    if (product?.variants?.edges?.[0]?.node) {
      setSelectedVariant(product.variants.edges[0].node);
    }
  }, [product]);

  if (!product || !selectedVariant) return null;

  const formatPrice = (price: MoneyV2) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currencyCode || 'USD',
      }).format(parseFloat(price.amount));
    } catch (e) {
      return '$0.00';
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      try {
        const item = {
          variantId: selectedVariant.id,
          productId: product.id,
          title: product.title,
          variantTitle: selectedVariant.selectedOptions?.map(opt => opt.value).join(' - ') || '',
          price: selectedVariant.price,
          image: product.featuredImage,
        };
        
        addToCart(item);
        openCart();
      } catch (error) {
        console.error('Error adding item to cart:', error);
        toast.error('Failed to add item to cart');
      }
    }
  };

  const formatProductTitle = (title: string) => {
    try {
      // Look for 'Fertilizer', 'Food', or 'Plant Food' (case-insensitive)
      const regex = /(.*?)(\s+(Fertilizer|Food|Plant Food))$/i;
      const match = title.match(regex);
      if (match) {
        return (
          <>
            <span className="font-black">{match[1].trim()}</span>
            {" | "}
            <span className="font-medium text-base text-gray-700">{match[3]}</span>
          </>
        );
      }
      // If no match, just bold the first word and de-emphasize the rest
      const [first, ...rest] = title.split(' ');
      return (
        <>
          <span className="font-black">{first}</span>
          {rest.length ? <span className="font-medium text-base text-gray-700">{' ' + rest.join(' ')}</span> : ''}
        </>
      );
    } catch (e) {
      return <span className="font-black">{title}</span>;
    }
  };

  const formatVariantTitle = (variant: Variant) => {
    if (!variant.selectedOptions || variant.selectedOptions.length === 0) {
      return variant.title || 'Default';
    }
    
    return variant.selectedOptions.map(opt => opt.value).join(' - ');
  };

  const imageSrc = imageError || !product.featuredImage?.url
    ? '/placeholder.png'
    : product.featuredImage.url;

  return (
    <div className={`rounded-3xl p-5 ${backgroundColor} transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm`}>
      {product.isBestSeller && (
        <div className="absolute top-4 right-4 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          Best Seller
        </div>
      )}
      <Link href={`/product/${product.handle}`} className="relative h-[280px] flex-grow mb-4 block">
        <Image
          src={imageSrc}
          alt={product.featuredImage?.altText || product.title}
          fill
          className="object-contain mix-blend-multiply"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority
          onError={() => setImageError(true)}
        />
      </Link>
      <div className="flex flex-col justify-end space-y-2">
        <div className="flex items-center mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-[#FF6B6B] fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-xs text-gray-600">{product.reviews || 0} reviews</span>
        </div>
        <h3 
          className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '48px',
          }}
        >
          {formatProductTitle(product.title)}
        </h3>
        
        <div className="flex items-center w-full gap-0 mt-auto">
          <div className="w-[50%] relative">
            <select 
              className="w-full appearance-none bg-white rounded-l-full pl-3 pr-8 py-2.5 border border-r-0 border-gray-200 text-sm focus:outline-none focus:border-[#FF6B6B]"
              value={selectedVariant.id}
              onChange={(e) => {
                const variant = product.variants.edges.find(v => v.node.id === e.target.value)?.node;
                if (variant) setSelectedVariant(variant);
              }}
            >
              {product.variants.edges?.map(({ node }) => (
                <option key={node.id} value={node.id}>
                  {formatVariantTitle(node)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="w-[25%] bg-white border-y border-gray-200 flex items-center justify-center py-2.5">
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(selectedVariant.price)}
            </span>
          </div>
          <button 
            className="w-[25%] bg-[#FF6B6B] py-2.5 rounded-r-full hover:bg-[#ff5252] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedVariant || selectedVariant.quantityAvailable < 1}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductWrapper = ({ product, backgroundColor }: ProductCardProps) => {
  try {
    return <ProductCard product={product} backgroundColor={backgroundColor} />;
  } catch (error) {
    console.error("Error rendering product card:", error);
    return <div className={`rounded-3xl p-5 ${backgroundColor} h-[450px] flex items-center justify-center`}>
      <p>Unable to display product</p>
    </div>;
  }
};

const ShopByPlant = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const loadMoreRef = useRef(null);
  // Add state to track swiper initialization issues
  const [swiperError, setSwiperError] = useState(false);
  const [swiperInit, setSwiperInit] = useState(false);

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products;

    const tabProducts = products.filter(product => {
      try {
        // Filter logic based on tab
        const title = product.title.toLowerCase();
        switch (activeTab) {
          case 'houseplants':
            return title.includes('house') || title.includes('indoor');
          case 'succulents':
            return title.includes('succulent') || title.includes('cactus');
          case 'tropical':
            return title.includes('tropical') || title.includes('monstera') || title.includes('palm');
          case 'vines':
            return title.includes('vine') || title.includes('trailing') || title.includes('pothos');
          default:
            return true;
        }
      } catch (e) {
        return false;
      }
    });
    
    return tabProducts;
  }, [products, activeTab]);

  // Function to fetch products with pagination
  const fetchProducts = useCallback(async (after?: string) => {
    try {
      if (after) {
        setLoadingMore(true);
      }
      
      const query = `
        query Products${after ? '($cursor: String!)' : ''} {
          products(first: 16${after ? ', after: $cursor' : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                description
                featuredImage {
                  url
                  altText
                }
                images(first: 3) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 25) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                      selectedOptions {
                        name
                        value
                      }
                      quantityAvailable
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await shopifyFetch({ 
        query,
        variables: after ? { cursor: after } : undefined
      });

      if (response.status === 200 && response.body?.data?.products?.edges) {
        const { products: { edges, pageInfo } } = response.body.data;
        
        const newProducts = edges.map(({ node }: any) => ({
          ...node,
          reviews: Math.floor(Math.random() * 1000) + 100,
        }));

        // Mark best sellers
        const productsWithBestSellers = newProducts.map((product: any) => ({
          ...product,
          isBestSeller: Math.random() < 0.2
        }));

        setProducts(prev => after ? [...prev, ...productsWithBestSellers] : productsWithBestSellers);
        setHasMore(pageInfo.hasNextPage);
        setCursor(pageInfo.endCursor);
      } else {
        setError('Failed to fetch products');
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      setError('Error fetching products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    try {
      fetchProducts();
    } catch (error) {
      console.error("Error in initial product fetch:", error);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    }
  }, [fetchProducts]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchProducts(cursor || undefined);
        }
      },
      { threshold: 0.1 }
    );
    
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [cursor, hasMore, loadingMore, loading, fetchProducts]);

  const backgroundColors = [
    "bg-[#F2F7F2]", // Light mint green
    "bg-[#F7F2F2]", // Light pink
    "bg-[#F2F5F7]", // Light blue
    "bg-[#F7F7F2]"  // Light yellow
  ];

  const handleSwiperError = () => {
    setSwiperError(true);
    console.error("Swiper initialization error");
  };

  const handleSwiperInit = (swiper: any) => {
    setSwiperInit(true);
    
    // Ensure pagination updates when slides change
    swiper.on('slideChange', function() {
      try {
        swiper.pagination.render();
        swiper.pagination.update();
      } catch (err) {
        console.error("Error updating pagination:", err);
      }
    });
    
    // Bind touch events for better mobile support
    swiper.on('touchStart', function() {
      try {
        document.body.style.overscrollBehavior = 'none';
      } catch (err) {
        console.error("Error in touchStart handler:", err);
      }
    });
    
    swiper.on('touchEnd', function() {
      try {
        document.body.style.overscrollBehavior = '';
      } catch (err) {
        console.error("Error in touchEnd handler:", err);
      }
    });
  };

  return (
    <section className="py-16 bg-[#FDF6EF]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Shop By Plant</h2>
        
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Link 
            href="/category/houseplants"
            className={`${activeTab === 'houseplants' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveTab('houseplants')}
          >
            HOUSEPLANTS
          </Link>
          <Link 
            href="/category/garden-plants"
            className={`${activeTab === 'garden-plants' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveTab('garden-plants')}
          >
            GARDEN PLANTS
          </Link>
          <Link 
            href="/category/hydro-aquatic"
            className={`${activeTab === 'hydro-aquatic' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveTab('hydro-aquatic')}
          >
            HYDRO & AQUATIC
          </Link>
          <Link 
            href="/category/supplements"
            className={`${activeTab === 'supplements' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveTab('supplements')}
          >
            SUPPLEMENTS
          </Link>
          <Link 
            href="/shop"
            className="bg-[#FF6B6B] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#ff5252] transition-colors"
            onClick={() => setActiveTab('all')}
          >
            SHOP ALL
          </Link>
        </div>

        {/* Product carousel with Swiper */}
        <div className="relative">
          {loading ? (
            <div className="w-full text-center py-12">Loading products...</div>
          ) : error ? (
            <div className="w-full text-center py-12 text-red-500">{error}</div>
          ) : swiperError ? (
            // Fallback to grid layout if Swiper fails
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map((product, index) => (
                <ProductWrapper
                  key={product.id}
                  product={product}
                  backgroundColor={backgroundColors[index % backgroundColors.length]}
                />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="swiper-container">
              <Swiper
                modules={[Navigation, Pagination, A11y, Virtual]}
                spaceBetween={16}
                slidesPerView={1}
                virtual={{
                  enabled: true,
                  addSlidesAfter: 2,
                  addSlidesBefore: 2
                }}
                navigation={{
                  enabled: true,
                  disabledClass: 'swiper-button-disabled',
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                }}
                pagination={{ 
                  enabled: true,
                  clickable: true,
                  el: '.swiper-pagination',
                  renderBullet: function (index, className) {
                    return '<span class="' + className + '" role="button" aria-label="Go to slide ' + (index + 1) + '"></span>';
                  },
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                  },
                }}
                className="mySwiper"
                onError={handleSwiperError}
                onInit={handleSwiperInit}
                watchSlidesProgress={true}
                touchRatio={1.5}
                touchReleaseOnEdges={true}
                touchStartPreventDefault={false}
                resistanceRatio={0.65}
              >
                {filteredProducts.map((product, index) => (
                  <SwiperSlide key={product.id} virtualIndex={index}>
                    <ProductWrapper
                      product={product}
                      backgroundColor={backgroundColors[index % backgroundColors.length]}
                    />
                  </SwiperSlide>
                ))}
                <div className="swiper-button-prev !text-gray-800 !w-10 !h-10 !bg-white/80 hover:!bg-white rounded-full shadow-lg !left-1 md:!left-0 after:!text-lg"></div>
                <div className="swiper-button-next !text-gray-800 !w-10 !h-10 !bg-white/80 hover:!bg-white rounded-full shadow-lg !right-1 md:!right-0 after:!text-lg"></div>
              </Swiper>
              <div className="swiper-pagination flex justify-center mt-6 gap-3"></div>
            </div>
          ) : (
            <div className="w-full text-center py-12">No products found for this category</div>
          )}
        </div>
      </div>
      
      {/* Custom styles for Swiper */}
      <style jsx global>{`
        .swiper-container {
          width: 100%;
          position: relative;
          overflow: hidden;
          touch-action: pan-y;
        }
        
        .swiper-wrapper {
          touch-action: pan-x;
        }
        
        .swiper-slide {
          touch-action: pan-x;
          height: auto !important;
        }
        
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        
        .swiper-button-next, .swiper-button-prev {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          color: #333;
          transition: background-color 0.3s ease;
          z-index: 10;
        }
        
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background-color: rgba(255, 255, 255, 1);
        }
        
        .swiper-button-disabled {
          opacity: 0.5 !important;
        }
        
        .swiper-pagination {
          position: relative !important;
          bottom: 0 !important;
          margin-top: 24px;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .swiper-pagination-bullet {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #e5e5e5;
          margin: 0 6px;
          transition: all 0.3s ease;
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background-color: #FF6B6B;
          width: 20px;
          border-radius: 10px;
        }
        
        @media (max-width: 640px) {
          .swiper {
            padding: 0 15px;
            overflow: hidden;
            touch-action: pan-y;
          }
          
          .swiper-button-next, .swiper-button-prev {
            width: 36px;
            height: 36px;
          }
          
          .swiper-button-next:after, .swiper-button-prev:after {
            font-size: 16px;
          }
          
          .swiper-slide {
            height: auto;
          }
        }
        
        @supports (-webkit-touch-callout: none) {
          /* Fix for iOS touch issues */
          .swiper-container {
            height: auto;
            min-height: 460px;
          }
          
          .swiper-wrapper {
            height: auto;
          }
          
          /* Additional iOS fixes */
          html, body {
            overscroll-behavior-y: none;
          }
        }
      `}</style>

      <div ref={loadMoreRef} className="w-full h-10 flex items-center justify-center mt-8">
        {loadingMore && (
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FF6B6B]"></div>
        )}
      </div>
    </section>
  );
};

export default ShopByPlant;