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
  const [isDragging, setIsDragging] = useState(false);

  const productLinkRef = useRef<HTMLAnchorElement>(null);

  // Prevent clicks if we're in a dragging state
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const swiper = document.querySelector('.swiper');
    
    const handleDragStart = () => {
      setIsDragging(true);
    };
    
    const handleDragEnd = () => {
      // Use a timeout to ensure the drag state is maintained long enough
      // to prevent accidental clicks right after releasing
      setTimeout(() => {
        setIsDragging(false);
      }, 300);
    };
    
    if (swiper) {
      swiper.addEventListener('mousedown', handleDragStart);
      swiper.addEventListener('touchstart', handleDragStart);
      swiper.addEventListener('mouseup', handleDragEnd);
      swiper.addEventListener('touchend', handleDragEnd);
      
      return () => {
        swiper.removeEventListener('mousedown', handleDragStart);
        swiper.removeEventListener('touchstart', handleDragStart);
        swiper.removeEventListener('mouseup', handleDragEnd);
        swiper.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, []);

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
            <span className="font-medium text-[11px] sm:text-base text-gray-700">{match[3]}</span>
          </>
        );
      }
      // If no match, just bold the first word and de-emphasize the rest
      const [first, ...rest] = title.split(' ');
      return (
        <>
          <span className="font-black">{first}</span>
          {rest.length ? <span className="font-medium text-[11px] sm:text-base text-gray-700">{' ' + rest.join(' ')}</span> : ''}
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
    <div className={`rounded-2xl sm:rounded-3xl p-3 sm:p-5 ${backgroundColor} transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm`}>
      {product.isBestSeller && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#FF6B6B] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold z-10">
          Best Seller
        </div>
      )}
      <Link 
        href={`/product/${product.handle}`} 
        className="relative h-[140px] sm:h-[280px] flex-grow mb-2 sm:mb-4 block"
        onClick={handleLinkClick}
        ref={productLinkRef}
      >
        <Image
          src={imageSrc}
          alt={product.featuredImage?.altText || product.title}
          fill
          className="object-contain mix-blend-multiply"
          sizes="(max-width: 640px) 140px, (max-width: 768px) 280px, 300px"
          priority
          onError={() => setImageError(true)}
        />
      </Link>
      <div className="flex flex-col justify-end space-y-1.5 sm:space-y-2">
        <div className="flex items-center mb-0.5 sm:mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-[#FF6B6B] fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-[10px] sm:text-xs text-gray-600">{product.reviews || 0} reviews</span>
        </div>
        <h3 
          className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-3 line-clamp-2 leading-tight"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {formatProductTitle(product.title)}
        </h3>
        
        <div className="flex items-center w-full gap-0 mt-auto">
          <div className="w-[50%] relative">
            <select 
              className="w-full appearance-none bg-white rounded-l-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2.5 border border-r-0 border-gray-200 text-[11px] sm:text-sm focus:outline-none focus:border-[#FF6B6B]"
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
            <div className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="w-[25%] bg-white border-y border-gray-200 flex items-center justify-center py-1.5 sm:py-2.5">
            <span className="text-[11px] sm:text-sm font-medium text-gray-900">
              {formatPrice(selectedVariant.price)}
            </span>
          </div>
          <button 
            className="w-[25%] bg-[#FF6B6B] py-1.5 sm:py-2.5 rounded-r-full hover:bg-[#ff5252] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedVariant || selectedVariant.quantityAvailable < 1}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
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
  const [isMounted, setIsMounted] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add resize listener to detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      // Reset showAll when switching between mobile and desktop
      if (!mobile) {
        setShowAll(false);
        setIsFilterOpen(false);
      }
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchProducts = useCallback(async (after?: string) => {
    try {
      if (after) {
        setLoadingMore(true);
      }
      
      // Define the houseplant product titles
      const houseplantProducts = [
        'Money Tree Fertilizer',
        'Jade Fertilizer',
        'Christmas Cactus Fertilizer',
        'Cactus Fertilizer',
        'Succulent Plant Food',
        'Bonsai Fertilizer',
        'Air Plant Fertilizer',
        'Snake Plant Fertilizer',
        'House Plant Food',
        'Mycorrhizal Fungi for Houseplants',
        'Granular Houseplant Food',
        'Granular Monstera Fertilizer',
        'Granular Lemon Tree Fertilizer',
        'Granular Indoor Plant Food',
        'Granular Fig Tree Fertilizer',
        'Granular Bonsai Fertilizer',
        'Monstera Root Supplement',
        'Houseplant Root Supplement',
        'Succulent Root Supplement',
        'Root Supplement',
        'Orchid Root Supplement',
        'Indoor Plant Food',
        'Instant Plant Food',
        'Ficus Fertilizer',
        'Banana Tree Fertilizer',
        'Philodendron Fertilizer',
        'Fiddle Leaf Fig Fertilizer',
        'Dracaena Fertilizer',
        'Bird of Paradise Fertilizer',
        'Aloe Vera Fertilizer',
        'ZZ Plant Fertilizer',
        'Tropical Plant Fertilizer',
        'Pothos Fertilizer',
        'Bromeliad Fertilizer',
        'Fiddle Leaf Fig Plant Food',
        'Monstera Plant Food',
        'African Violet Fertilizer',
        'Alocasia Fertilizer',
        'Anthurium Fertilizer',
        'Bamboo Fertilizer',
        'Brazilian Wood Plant Food',
        'Carnivorous Plant Food',
        'Curry Leaf Plant Fertilizer',
        'Elephant Ear Fertilizer',
        'Hoya Fertilizer',
        'Lucky Bamboo Fertilizer',
        'Orchid Plant Food',
        'Peace Lily Fertilizer',
        'Pitcher Plant Food'
      ];

      // Define lawn and garden product titles
      const lawnAndGardenProducts = [
        'Bougainvillea Fertilizer',
        'Camellia Fertilizer',
        'Cut Flower Food',
        'Desert Rose Fertilizer',
        'Flowering Fertilizer',
        'Rose Bush Fertilizer',
        'Rose Fertilizer',
        'Plumeria Fertilizer',
        'Hydrangea Fertilizer',
        'Hibiscus Fertilizer',
        'Azalea Fertilizer',
        'Gardenia Fertilizer',
        'Rhododendron Fertilizer',
        'Petunia Fertilizer',
        'Geranium Fertilizer',
        'Hanging Basket Plant Food',
        'Flowering Plant Food',
        'Daffodil Bulb Fertilizer',
        'Tulip Bulb Fertilizer',
        'Mum Fertilizer',
        'Ixora Fertilizer',
        'Bulb Fertilizer',
        'Lilac Bush Fertilizer',
        'Bloom Fertilizer',
        'Berry Fertilizer',
        'Pepper Fertilizer',
        'Tomato Fertilizer',
        'Strawberry Fertilizer',
        'Blueberry Fertilizer',
        'Herbs and Leafy Greens Plant Food',
        'Vegetable Fertilizer',
        'Pumpkin Fertilizer',
        'Potato Fertilizer',
        'Garlic Fertilizer',
        'Water Soluble Fertilizer',
        'Garden Fertilizer',
        'Plant Food Outdoor',
        'Plant Food',
        'Plant Fertilizer',
        'All Purpose Fertilizer',
        'All Purpose NPK Fertilizer',
        'Starter Fertilizer',
        '10-10-10 for General Use',
        '10-10-10 for Vegetables',
        '10-10-10 for Plants',
        'Fall Fertilizer',
        'Winter Fertilizer',
        'Ivy Plant Food',
        'Lawn Fertilizer',
        'Mycorrhizal Fungi for Trees',
        'Mycorrhizal Fungi for Palm Trees',
        'Mycorrhizal Fungi for Gardens',
        'Mycorrhizal Fungi for Citrus Trees',
        'Mycorrhizal Fungi',
        'Root Booster for Plants',
        'Soil Microbes for Gardening',
        'Trichoderma for Plants',
        'Peach Tree Fertilizer',
        'Olive Tree Fertilizer',
        'Mango Tree Fertilizer',
        'Lime Tree Fertilizer',
        'Evergreen Fertilizer',
        'Arborvitae Fertilizer',
        'Palm Fertilizer',
        'Apple Tree Fertilizer',
        'Citrus Fertilizer',
        'Tree Fertilizer',
        'Fruit Tree Fertilizer',
        'Lemon Tree Fertilizer',
        'Avocado Tree Fertilizer',
        '10-10-10 for Trees',
        'Aspen Tree Fertilizer',
        'Boxwood Fertilizer',
        'Crepe Myrtle Fertilizer',
        'Dogwood Tree Fertilizer',
        'Japanese Maple Fertilizer',
        'Magnolia Tree Fertilizer',
        'Maple Tree Fertilizer',
        'Oak Tree Fertilizer',
        'Orange Tree Fertilizer',
        'Pine Tree Fertilizer',
        'Root Stimulator for Trees',
        'Sago Palm Fertilizer',
        'Shrub Fertilizer',
        'Tree And Shrub Fertilizer',
        'Jasmine Fertilizer'
      ];
      
      // Define hydro and aquatic product titles
      const hydroAquaticProducts = [
        'Liquid Plant Food',
        'Lotus Fertilizer',
        'Aquarium Plant Fertilizer',
        'Aquatic Plant Fertilizer',
        'Water Garden Fertilizer',
        'Water Lily Fertilizer',
        'Hydroponic Nutrients',
        'Hydroponic Plant Food'
      ];
      
      // Define specialty supplements product titles
      const specialtySupplements = [
        'Fish Emulsion Fertilizer',
        'Fish Fertilizer',
        'Silica for Plants',
        'Cal-Mag Fertilizer',
        'Seaweed Fertilizer',
        'Calcium for Plants',
        'Calcium Nitrate',
        'Worm Castings Concentrate',
        'Compost Starter and Accelerator',
        'Compost Tea',
        'Sulfur for Plants',
        'Phosphorus Fertilizer',
        'Potassium Fertilizer',
        'Ferrous Sulfate For Plants',
        'Urea Fertilizer',
        'Magnesium for Plants',
        'Potassium Nitrate Fertilizer',
        'Ammonium Nitrate Fertilizer',
        'Potassium Sulfate Fertilizer',
        'Sulfate Of Potash',
        'Potash Fertilizer',
        'Muriate Of Potash',
        'Phosphorus and Potassium Fertilizer',
        'Compost Tea for Plants',
        'Kelp Meal Fertilizer',
        'Nitrogen Fertilizer',
        'Seaweed Extract for Plants',
        'pH Down',
        'pH Up'
      ];
      
      let query;
      let variables;
      
      // Use 250 as the maximum number of products to fetch at once (Shopify limit)
      const maxProductsPerFetch = 250;
      
      // For all specific categories, we'll fetch all products and filter client-side
      if (activeTab === 'houseplants' || activeTab === 'garden-plants' || 
          activeTab === 'hydro-aquatic' || activeTab === 'supplements') {
        query = `
          query Products${after ? '($cursor: String!)' : ''} {
            products(first: ${maxProductsPerFetch}${after ? ', after: $cursor' : ''}) {
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
                  images(first: 5) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 100) {
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
        
        variables = after ? { cursor: after } : undefined;
      } else {
        // For "all" products, use a more general approach without filtering
        query = `
        query Products${after ? '($cursor: String!)' : ''} {
            products(first: ${maxProductsPerFetch}${after ? ', after: $cursor' : ''}) {
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
                  images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                  variants(first: 100) {
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
        
        variables = after ? { cursor: after } : undefined;
      }

      const response = await shopifyFetch({ 
        query,
        variables
      });

      if (response.status === 200 && response.body?.data?.products?.edges) {
        const { products: { edges, pageInfo } } = response.body.data;
        
        // Filter products based on the active tab
        let filteredEdges = edges;
        if (activeTab === 'houseplants') {
          const houseplantSet = new Set(houseplantProducts.map(name => name.toLowerCase()));
          filteredEdges = edges.filter(({ node }: any) => 
            houseplantSet.has(node.title.toLowerCase())
          );
        } else if (activeTab === 'garden-plants') {
          const gardenSet = new Set(lawnAndGardenProducts.map(name => name.toLowerCase()));
          filteredEdges = edges.filter(({ node }: any) => 
            gardenSet.has(node.title.toLowerCase())
          );
        } else if (activeTab === 'hydro-aquatic') {
          const hydroSet = new Set(hydroAquaticProducts.map(name => name.toLowerCase()));
          filteredEdges = edges.filter(({ node }: any) => 
            hydroSet.has(node.title.toLowerCase())
          );
        } else if (activeTab === 'supplements') {
          const supplementsSet = new Set(specialtySupplements.map(name => name.toLowerCase()));
          filteredEdges = edges.filter(({ node }: any) => 
            supplementsSet.has(node.title.toLowerCase())
          );
        }
        
        const newProducts = filteredEdges.map(({ node }: any) => ({
          ...node,
          reviews: Math.floor(Math.random() * 1000) + 100,
        }));

        // Mark best sellers
        const productsWithBestSellers = newProducts.map((product: any) => ({
          ...product,
          isBestSeller: Math.random() < 0.2
        }));

        setProducts(prev => after ? [...prev, ...productsWithBestSellers] : productsWithBestSellers);
        
        // If hasNextPage is true and we didn't get all products for the current category,
        // we should fetch the next page automatically
        const currentCategoryList = activeTab === 'houseplants' ? houseplantProducts : 
                                   activeTab === 'garden-plants' ? lawnAndGardenProducts :
                                   activeTab === 'hydro-aquatic' ? hydroAquaticProducts : 
                                   activeTab === 'supplements' ? specialtySupplements : [];
                                    
        if (pageInfo.hasNextPage && 
            (activeTab === 'houseplants' || activeTab === 'garden-plants' || 
             activeTab === 'hydro-aquatic' || activeTab === 'supplements') && 
            currentCategoryList.length > productsWithBestSellers.length) {
          // Auto-fetch next page
          fetchProducts(pageInfo.endCursor);
        } else {
        setHasMore(pageInfo.hasNextPage);
        setCursor(pageInfo.endCursor);
        }
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
  }, [activeTab]);

  // Handle tab change with animation
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    
    // Fade out
    setFadeIn(false);
    
    // Change tab after short delay
    setTimeout(() => {
      setActiveTab(tab);
      // Fade in
      setTimeout(() => {
        setFadeIn(true);
      }, 50);
    }, 300);

    // Close filter dropdown if open
    setIsFilterOpen(false);
  };

  // Update useEffect to refetch when activeTab changes
  useEffect(() => {
    try {
      setLoading(true);
      setCursor(null);
      setProducts([]);
      fetchProducts();
      setIsMounted(true);
    } catch (error) {
      console.error("Error in product fetch:", error);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    }
  }, [fetchProducts, activeTab]);

  const backgroundColors = [
    "bg-[#F2F7F2]", // Light mint green
    "bg-[#F7F2F2]", // Light pink
    "bg-[#F2F5F7]", // Light blue
    "bg-[#F7F7F2]"  // Light yellow
  ];

  // Render mobile grid view
  const renderMobileGrid = () => {
    const displayedProducts = showAll ? products : products.slice(0, 5);
    
    return (
      <div className="space-y-6">
        <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          {displayedProducts.map((product, index) => (
            <div key={product.id} className="w-full">
              <ProductWrapper
                product={product}
                backgroundColor={backgroundColors[index % backgroundColors.length]}
              />
            </div>
          ))}
        </div>
        
        {!showAll && products.length > 5 && (
          <div className="flex justify-center mt-6">
            <Link 
              href={`/shop/${activeTab !== 'all' ? activeTab : ''}`}
              className="bg-[#FF6B6B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#ff5252] transition-colors inline-flex items-center space-x-2"
            >
              <span>SEE ALL {getCategoryDisplayName()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Render desktop slider
  const renderDesktopSlider = () => {
    return (
      <div className={`swiper-wrapper-custom transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={16}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ 
            el: '.swiper-pagination',
            clickable: true,
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
          simulateTouch={true}
          threshold={10}
          preventClicks={true}
          preventClicksPropagation={true}
          grabCursor={true}
          touchStartPreventDefault={true}
          noSwipingClass="no-swiping"
          watchSlidesProgress={true}
          shortSwipes={true}
          longSwipesMs={100}
          longSwipesRatio={0.1}
          followFinger={true}
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id}>
              <ProductWrapper
                product={product}
                backgroundColor={backgroundColors[index % backgroundColors.length]}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-button-prev !text-gray-800 !w-10 !h-10 !bg-white/80 hover:!bg-white rounded-full shadow-lg !left-1 md:!left-2 after:!text-lg no-swiping"></div>
        <div className="swiper-button-next !text-gray-800 !w-10 !h-10 !bg-white/80 hover:!bg-white rounded-full shadow-lg !right-1 md:!right-2 after:!text-lg no-swiping"></div>
        <div className="swiper-pagination flex justify-center mt-6 gap-3 no-swiping"></div>
      </div>
    );
  };

  // Function to get category name for display
  const getCategoryDisplayName = () => {
    switch(activeTab) {
      case 'houseplants': return 'HOUSEPLANTS';
      case 'garden-plants': return 'GARDEN PLANTS';
      case 'hydro-aquatic': return 'HYDRO & AQUATIC PLANTS';
      case 'supplements': return 'SUPPLEMENTS';
      default: return 'GARDEN PLANTS';
    }
  };

  // Get the display name for the current category
  const getSelectedLabel = () => {
    switch(activeTab) {
      case 'houseplants': return 'HOUSEPLANTS';
      case 'garden-plants': return 'LAWN AND GARDEN';
      case 'hydro-aquatic': return 'HYDRO & AQUATIC';
      case 'supplements': return 'SPECIALTY SUPPLEMENTS';
      default: return 'SHOP ALL';
    }
  };

  return (
    <section className="py-16 bg-[#FDF6EF]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8">Shop By Plant</h2>
        
        {/* Mobile Dropdown Filter */}
        <div className="block sm:hidden mb-8">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-[#E8E0D4] text-[#8B7355] px-6 py-3 rounded-full font-medium text-base flex items-center justify-between"
          >
            <span>{getSelectedLabel()}</span>
            <svg 
              className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isFilterOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => handleTabChange('houseplants')}
                className={`w-full px-6 py-3 text-left transition-colors ${
                  activeTab === 'houseplants'
                    ? 'bg-[#8B7355] text-white'
                    : 'text-[#8B7355] hover:bg-[#E8E0D4]'
                }`}
              >
                HOUSEPLANTS
              </button>
              <button
                onClick={() => handleTabChange('garden-plants')}
                className={`w-full px-6 py-3 text-left transition-colors ${
                  activeTab === 'garden-plants'
                    ? 'bg-[#8B7355] text-white'
                    : 'text-[#8B7355] hover:bg-[#E8E0D4]'
                }`}
              >
                LAWN AND GARDEN
              </button>
              <button
                onClick={() => handleTabChange('hydro-aquatic')}
                className={`w-full px-6 py-3 text-left transition-colors ${
                  activeTab === 'hydro-aquatic'
                    ? 'bg-[#8B7355] text-white'
                    : 'text-[#8B7355] hover:bg-[#E8E0D4]'
                }`}
              >
                HYDRO & AQUATIC
              </button>
              <button
                onClick={() => handleTabChange('supplements')}
                className={`w-full px-6 py-3 text-left transition-colors ${
                  activeTab === 'supplements'
                    ? 'bg-[#8B7355] text-white'
                    : 'text-[#8B7355] hover:bg-[#E8E0D4]'
                }`}
              >
                SPECIALTY SUPPLEMENTS
              </button>
              <button 
                onClick={() => handleTabChange('all')}
                className="w-full px-6 py-3 text-left bg-[#FF6B6B] text-white hover:bg-[#ff5252] transition-colors"
              >
                SHOP ALL
              </button>
            </div>
          )}
        </div>
        
        {/* Desktop Filter Buttons */}
        <div className="hidden sm:flex sm:flex-wrap sm:justify-center sm:gap-3 mb-8">
          <button 
            className={`${activeTab === 'houseplants' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('houseplants');
            }}
          >
            HOUSEPLANTS
          </button>
          <button 
            className={`${activeTab === 'garden-plants' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('garden-plants');
            }}
          >
            LAWN AND GARDEN
          </button>
          <button 
            className={`${activeTab === 'hydro-aquatic' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('hydro-aquatic');
            }}
          >
            HYDRO & AQUATIC
          </button>
          <button 
            className={`${activeTab === 'supplements' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('supplements');
            }}
          >
            SPECIALTY SUPPLEMENTS
          </button>
          <button 
            className="bg-[#FF6B6B] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#ff5252] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('all');
            }}
          >
            SHOP ALL
          </button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="w-full text-center py-12">Loading products...</div>
          ) : error ? (
            <div className="w-full text-center py-12 text-red-500">{error}</div>
          ) : products && products.length > 0 && isMounted ? (
            isMobile ? renderMobileGrid() : renderDesktopSlider()
          ) : (
            <div className="w-full text-center py-12">No products found for this category</div>
          )}
        </div>
      </div>
      
      {/* Custom styles for Swiper */}
      <style jsx global>{`
        .swiper-wrapper-custom {
          width: 100%;
          position: relative;
          overflow: visible;
          z-index: 1;
        }
        
        .swiper {
          margin: 0;
          padding: 0 20px;
          overflow: visible;
          position: static;
        }
        
        .swiper-wrapper {
          display: flex;
          height: auto;
        }
        
        .swiper-slide {
          height: auto;
          width: auto;
          flex-shrink: 0;
          touch-action: none;
        }
        
        .swiper-slide a {
          pointer-events: auto;
        }
        
        /* When dragging, temporarily disable pointer events on links */
        .swiper-slide-active.swiper-slide-moving a {
          pointer-events: none;
        }
        
        .swiper-button-next, .swiper-button-prev {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          color: #333;
          transition: all 0.3s ease;
          z-index: 10;
          pointer-events: auto !important;
        }
        
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background-color: white;
          transform: scale(1.05);
        }
        
        .swiper-button-disabled {
          opacity: 0.35 !important;
          cursor: auto;
          pointer-events: none;
        }
        
        .swiper-pagination {
          position: relative !important;
          bottom: 0 !important;
          margin-top: 24px;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 6px;
          pointer-events: auto !important;
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
          cursor: pointer;
        }

        .swiper-pagination-bullet-active {
          background-color: #FF6B6B;
          width: 20px;
          border-radius: 10px;
        }
        
        .no-swiping {
          touch-action: auto !important;
          pointer-events: auto !important;
        }
        
        /* Handle touch gestures more consistently */
        @media (pointer: coarse) {
          .swiper {
            touch-action: pan-y;
          }
        }
        
        @media (max-width: 640px) {
          .swiper {
            padding: 0 15px;
          }
          
          .swiper-button-next, .swiper-button-prev {
            width: 36px;
            height: 36px;
          }
          
          .swiper-button-next:after, .swiper-button-prev:after {
            font-size: 16px;
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