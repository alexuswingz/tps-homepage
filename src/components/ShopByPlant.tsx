"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { shopifyFetch } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useCartUI } from '@/app/template';

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
  const { addToCart } = useCart();
  const { openCart } = useCartUI();

  useEffect(() => {
    if (product?.variants?.edges?.[0]?.node) {
      setSelectedVariant(product.variants.edges[0].node);
    }
  }, [product]);

  if (!product || !selectedVariant) return null;

  const formatPrice = (price: MoneyV2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD',
    }).format(parseFloat(price.amount));
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
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
    }
  };

  const formatProductTitle = (title: string) => {
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
  };

  return (
    <div className={`rounded-3xl p-5 ${backgroundColor} transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm`}>
      {product.isBestSeller && (
        <div className="absolute top-4 right-4 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          Best Seller
        </div>
      )}
      <div className="relative h-[280px] flex-grow mb-4">
        <Image
          src={product.featuredImage?.url || '/placeholder.png'}
          alt={product.featuredImage?.altText || product.title}
          fill
          className="object-contain mix-blend-multiply"
          sizes="(max-width: 768px) 280px, 300px"
          priority
        />
      </div>
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
                  {node.selectedOptions?.map(opt => opt.value).join(' - ')}
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

const ShopByPlant = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('HOUSEPLANTS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [dragStarted, setDragStarted] = useState(false);
  const dragThreshold = 8; // px
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollTime = useRef<number>(0);
  const lastScrollLeft = useRef<number>(0);
  const scrollAnimationFrame = useRef<number | null>(null);

  const houseplantsList = [
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
    'Houseplant Root Supplement',
    'Succulent Root Supplement',
    'Fig Root Supplement',
    'Orchid Root Supplement',
    'Indoor Plant Food',
    'Instant Plant Food',
    'Ficus Fertilizer',
    'Banana Tree Fertilizer',
    'Philodendron Fertilizer',
    'Fern Fertilizer',
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

  const gardenPlantsList = [
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
    'Trichoderma for Plants'
  ];

  const hydroAquaticList = [
    'Liquid Plant Food',
    'Lotus Fertilizer',
    'Aquarium Plant Fertilizer',
    'Aquatic Plant Fertilizer',
    'Water Garden Fertilizer',
    'Water Plant Fertilizer',
    'Hydroponic Nutrients',
    'Hydroponic Plant Food'
  ];

  const supplementsList = [
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

  const treesAndShrubsList = [
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

  const scrollProducts = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 300 + 24; // card width + gap
      const visibleCards = Math.floor(container.clientWidth / cardWidth);
      const scrollAmount = direction === 'left' ? -cardWidth * visibleCards : cardWidth * visibleCards;
      
      const newScrollPosition = container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
      
      // Update active slide
      setTimeout(() => {
        updateActiveSlide();
      }, 500);
    }
  };

  const updateActiveSlide = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 300 + 24; // card width + gap
      const scrollPosition = container.scrollLeft;
      const newActiveSlide = Math.floor(scrollPosition / (cardWidth * 4));
      setActiveSlide(newActiveSlide);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    // Don't initiate drag if clicking on form elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.tagName === 'BUTTON' || 
        target.closest('select') || target.closest('button')) {
      return;
    }
    
    // Allow dragging from anywhere else in the container
    e.preventDefault(); // Prevent default behavior
    setDragStarted(false);
    setIsDragging(true); // Set dragging to true immediately
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    lastScrollLeft.current = scrollContainerRef.current.scrollLeft;
    lastScrollTime.current = Date.now();
    if (scrollContainerRef.current.style.scrollBehavior !== 'auto') {
      scrollContainerRef.current.style.scrollBehavior = 'auto';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    
    // Don't initiate drag if touching form elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.tagName === 'BUTTON' || 
        target.closest('select') || target.closest('button')) {
      return;
    }
    
    // Allow dragging from anywhere else in the container
    e.preventDefault(); // Prevent default behavior
    setDragStarted(false);
    setIsDragging(true); // Set dragging to true immediately
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    lastScrollLeft.current = scrollContainerRef.current.scrollLeft;
    lastScrollTime.current = Date.now();
    if (scrollContainerRef.current.style.scrollBehavior !== 'auto') {
      scrollContainerRef.current.style.scrollBehavior = 'auto';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || !isDragging) return;
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startX;
    
    if (!dragStarted && Math.abs(walk) > dragThreshold) {
      setDragStarted(true);
      // Only prevent default once we've confirmed this is a drag operation
      e.preventDefault();
    }
    
    if (isDragging && dragStarted) {
      // Only prevent default for confirmed drag operations
      e.preventDefault();
      
      const currentTime = performance.now();
      const timeDiff = currentTime - lastScrollTime.current;
      const currentScrollLeft = scrollContainerRef.current.scrollLeft;
      const scrollDiff = currentScrollLeft - lastScrollLeft.current;
      
      // Calculate velocity with improved precision
      const velocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;
      setScrollVelocity(velocity);
      
      // Smoother scrolling with easing
      const scrollMultiplier = 1.2; // Further reduced for smoother movement
      const newScrollLeft = scrollLeft - walk * scrollMultiplier;
      
      // Apply smooth scrolling with RAF
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
      }
      
      scrollAnimationFrame.current = requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = newScrollLeft;
          // Only update scrolling state if it's not already set
          if (!isScrolling) {
            setIsScrolling(true);
          }
        }
      });
      
      lastScrollLeft.current = currentScrollLeft;
      lastScrollTime.current = currentTime;
      
      // Debounce the scrolling state update
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 100);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || !isDragging) return;
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startX;
    
    if (!dragStarted && Math.abs(walk) > dragThreshold) {
      setDragStarted(true);
      // Only prevent default once we've confirmed this is a drag operation
      e.preventDefault();
    }
    
    if (isDragging && dragStarted) {
      // Only prevent default for confirmed drag operations
      e.preventDefault();
      
      const currentTime = performance.now();
      const timeDiff = currentTime - lastScrollTime.current;
      const currentScrollLeft = scrollContainerRef.current.scrollLeft;
      const scrollDiff = currentScrollLeft - lastScrollLeft.current;
      
      // Calculate velocity with improved precision
      const velocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;
      setScrollVelocity(velocity);
      
      // Smoother scrolling with easing
      const scrollMultiplier = 1.2; // Further reduced for smoother movement
      const newScrollLeft = scrollLeft - walk * scrollMultiplier;
      
      // Apply smooth scrolling with RAF
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
      }
      
      scrollAnimationFrame.current = requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = newScrollLeft;
          // Only update scrolling state if it's not already set
          if (!isScrolling) {
            setIsScrolling(true);
          }
        }
      });
      
      lastScrollLeft.current = currentScrollLeft;
      lastScrollTime.current = currentTime;
      
      // Debounce the scrolling state update
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 100);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDragStarted(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = 'smooth';
      if (dragStarted) {
        applyMomentum();
      } else {
        snapToCard();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDragStarted(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = 'smooth';
      if (dragStarted) {
        applyMomentum();
      } else {
        snapToCard();
      }
    }
  };

  const applyMomentum = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = 300 + 24; // card width + gap
    const currentScrollLeft = container.scrollLeft;
    const velocity = scrollVelocity;
    
    // Enhanced momentum calculation with damping
    const momentumDistance = velocity * 1200; // Reduced for more controlled momentum
    const targetScrollLeft = currentScrollLeft + momentumDistance;
    
    // Find nearest card position with improved snapping
    const nearestCardIndex = Math.round(targetScrollLeft / cardWidth);
    const finalScrollLeft = nearestCardIndex * cardWidth;
    
    // Smooth animation with easing
    const startTime = performance.now();
    const duration = 600; // Reduced duration for snappier feel
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Improved easing function for smoother animation
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      const easedProgress = easeOutQuart(progress);
      
      const currentScroll = currentScrollLeft + (finalScrollLeft - currentScrollLeft) * easedProgress;
      
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = currentScroll;
      }
      
      if (progress < 1) {
        scrollAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        // Update active slide after animation completes
        updateActiveSlide();
      }
    };
    
    scrollAnimationFrame.current = requestAnimationFrame(animate);
  };

  const snapToCard = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 300 + 24; // card width + gap
    const scrollPosition = container.scrollLeft;
    const nearestCardIndex = Math.round(scrollPosition / cardWidth);
    
    // Smooth animation with easing
    const startTime = performance.now();
    const duration = 400; // Reduced duration for snappier feel
    const startScroll = container.scrollLeft;
    const targetScroll = nearestCardIndex * cardWidth;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Improved easing function for smoother animation
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      const easedProgress = easeOutQuart(progress);
      
      const currentScroll = startScroll + (targetScroll - startScroll) * easedProgress;
      
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = currentScroll;
      }
      
      if (progress < 1) {
        scrollAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        // Update active slide after animation completes
        updateActiveSlide();
      }
    };
    
    scrollAnimationFrame.current = requestAnimationFrame(animate);
  };

  const handleScroll = () => {
    if (!isScrolling) {
      updateActiveSlide();
    }
    
    // Add debounce for performance
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!isDragging) snapToCard();
    }, 150);
  };

  const markBestSellers = (products: Product[]) => {
    // Use a seeded random number generator for consistency
    const seededRandom = (seed: number) => {
      return function() {
        seed = Math.sin(seed) * 10000;
        return seed - Math.floor(seed);
      };
    };

    // Use product ID as seed for consistency
    return products.map(product => {
      const random = seededRandom(parseInt(product.id.replace(/\D/g, ''), 10))();
      // Mark ~20% of products as best sellers
      return {
        ...product,
        isBestSeller: random < 0.2,
        // Add a popularity score for sorting
        popularityScore: random
      };
    });
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      let hasNextPage = true;
      let cursor = null;
      let allProducts: Product[] = [];

      while (hasNextPage) {
        const query = `
          query Products${cursor ? '($cursor: String!)' : ''} {
            products(first: 100${cursor ? ', after: $cursor' : ''}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  id
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                  variants(first: 10) {
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

        try {
          const response = await shopifyFetch({ 
            query,
            variables: cursor ? { cursor } : undefined
          });

          if (response.status === 200 && response.body?.data?.products?.edges) {
            const { products: { edges, pageInfo } } = response.body.data;
            
            const newProducts = edges.map(({ node }: any) => ({
              ...node,
              reviews: Math.floor(Math.random() * 1000) + 100,
            }));

            allProducts = [...allProducts, ...newProducts];
            
            hasNextPage = pageInfo.hasNextPage;
            cursor = pageInfo.endCursor;
          } else {
            setError('Failed to fetch products');
            console.error('Invalid response format:', response);
            break;
          }
        } catch (error) {
          setError('Error fetching products');
          console.error('Error fetching products:', error);
          break;
        }
      }

      // Mark best sellers after fetching all products
      const productsWithBestSellers = markBestSellers(allProducts);
      setProducts(productsWithBestSellers);
      setLoading(false);
    };

    fetchAllProducts();
  }, []);

  // Filter products based on category and search query
  useEffect(() => {
    // First filter by category
    let categoryFiltered: Product[] = [];
    
    if (activeCategory === 'HOUSEPLANTS') {
      // Filter for houseplants using the exact product names
      categoryFiltered = products.filter(product => 
        houseplantsList.some(houseplant => {
          const productTitle = product.title.trim();
          return productTitle === houseplant || productTitle.includes(houseplant);
        })
      );
    } else if (activeCategory === 'GARDEN PLANTS') {
      // Filter for garden plants using exact product names
      categoryFiltered = products.filter(product => 
        gardenPlantsList.some(gardenPlant => {
          const productTitle = product.title.trim();
          return productTitle === gardenPlant || productTitle.includes(gardenPlant);
        })
      );
    } else if (activeCategory === 'HYDRO & AQUATIC') {
      // Filter for hydroponic and aquatic plants using exact product names
      categoryFiltered = products.filter(product => 
        hydroAquaticList.some(hydroPlant => {
          const productTitle = product.title.trim();
          return productTitle === hydroPlant || productTitle.includes(hydroPlant);
        })
      );
    } else if (activeCategory === 'SUPPLEMENTS') {
      // Filter for supplements and additives using exact product names
      categoryFiltered = products.filter(product => 
        supplementsList.some(supplement => {
          const productTitle = product.title.trim();
          return productTitle === supplement || productTitle.includes(supplement);
        })
      );
    } else if (activeCategory === 'ALL') {
      categoryFiltered = products;
    }
    
    // Then filter by search query if one exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchFiltered = categoryFiltered.filter(product => 
        product.title.toLowerCase().includes(query)
      );
      setFilteredProducts(searchFiltered);
    } else {
      setFilteredProducts(categoryFiltered);
    }
    
  }, [activeCategory, products, searchQuery]);

  useEffect(() => {
    // Add scroll event listener
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
      }
    };
  }, [isDragging, isScrolling]);

  const backgroundColors = [
    "bg-[#F2F7F2]", // Light mint green
    "bg-[#F7F2F2]", // Light pink
    "bg-[#F2F5F7]", // Light blue
    "bg-[#F7F7F2]"  // Light yellow
  ];

  // Calculate number of pages
  const itemsPerPage = 4;
  const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first slide when search changes
    setActiveSlide(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  return (
    <section className="w-full bg-[#FDF6EF] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-[#FF6B6B] text-4xl sm:text-5xl font-bold mb-2">Shop by Plant</h2>
            <p className="text-xl sm:text-2xl font-medium text-gray-700">What are you growing?</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <input 
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 pl-10 pr-4 w-full max-w-[250px] outline-none focus:border-[#FF6B6B] text-sm"
                aria-label="Search products"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Category buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button 
            className={`${activeCategory === 'HOUSEPLANTS' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveCategory('HOUSEPLANTS')}
          >
            HOUSEPLANTS
          </button>
          <button 
            className={`${activeCategory === 'GARDEN PLANTS' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveCategory('GARDEN PLANTS')}
          >
            GARDEN PLANTS
          </button>
          <button 
            className={`${activeCategory === 'HYDRO & AQUATIC' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveCategory('HYDRO & AQUATIC')}
          >
            HYDRO & AQUATIC
          </button>
          <button 
            className={`${activeCategory === 'SUPPLEMENTS' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'} px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-[#8B7355] hover:text-white`}
            onClick={() => setActiveCategory('SUPPLEMENTS')}
          >
            SUPPLEMENTS
          </button>
          <button 
            className="bg-[#FF6B6B] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#ff5252] transition-colors"
            onClick={() => setActiveCategory('ALL')}
          >
            SHOP ALL
          </button>
        </div>

        {/* Product scroll container with navigation buttons */}
        <div className="relative">
          {filteredProducts.length > 0 && (
            <button
              onClick={() => scrollProducts('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-opacity duration-200 ease-in-out"
              style={{ opacity: activeSlide > 0 ? 1 : 0.5 }}
              disabled={activeSlide === 0}
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              touchAction: 'pan-y',
              willChange: 'transform, scroll-position',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {loading ? (
              <div className="flex-shrink-0 w-full text-center py-12">Loading products...</div>
            ) : error ? (
              <div className="flex-shrink-0 w-full text-center py-12 text-red-500">{error}</div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-[300px] snap-center transition-transform duration-300 ease-out select-none"
                  style={{ 
                    transform: isScrolling ? 'scale(0.98)' : 'scale(1)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  <ProductCard 
                    product={product}
                    backgroundColor={backgroundColors[index % backgroundColors.length]}
                  />
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full text-center py-12">No products found for this category</div>
            )}
          </div>

          {filteredProducts.length > 0 && (
            <button
              onClick={() => scrollProducts('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-opacity duration-200 ease-in-out"
              style={{ opacity: activeSlide < totalPages - 1 ? 1 : 0.5 }}
              disabled={activeSlide >= totalPages - 1}
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Improved scroll indicator dots */}
        {filteredProducts.length > 0 && !loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-3">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button 
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === index ? 'bg-[#FF6B6B] w-5' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const cardWidth = 300 + 24; // card width + gap
                    scrollContainerRef.current.scrollTo({
                      left: index * cardWidth * itemsPerPage,
                      behavior: 'smooth'
                    });
                    setActiveSlide(index);
                  }
                }}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByPlant;