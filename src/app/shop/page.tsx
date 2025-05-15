"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import { useCartUI } from '@/app/template';
import { useSearchParams } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify';

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
  category?: string;
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

// Category lists from ShopByPlant component
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
  'Monstera Root Supplement',
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

const CategoryFilter = ({ selectedCategory, onCategoryChange, searchQuery, onSearchChange }: { 
  selectedCategory: string; 
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: 'houseplants', label: 'HOUSEPLANTS' },
    { id: 'garden-plants', label: 'LAWN AND GARDEN' },
    { id: 'hydro-aquatic', label: 'HYDRO & AQUATIC' },
    { id: 'supplements', label: 'SPECIALTY SUPPLEMENTS' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
    const element = document.getElementById(categoryId);
    if (element) {
      const navbarHeight = 88;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navbarHeight - 24,
        behavior: 'smooth'
      });
    }
  };

  const selectedLabel = categories.find(cat => cat.id === selectedCategory)?.label || 'HOUSEPLANTS';

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* Search Bar - Both Mobile and Desktop */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white px-6 py-3 rounded-full border border-gray-200 pr-12 focus:outline-none focus:border-[#8B7355] text-gray-800 placeholder-gray-400"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="block sm:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#E8E0D4] text-[#8B7355] px-6 py-3 rounded-full font-medium text-base flex items-center justify-between"
        >
          <span>{selectedLabel}</span>
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-20">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full px-6 py-3 text-left transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#8B7355] text-white'
                    : 'text-[#8B7355] hover:bg-[#E8E0D4]'
                }`}
              >
                {category.label}
              </button>
            ))}
            <button 
              onClick={() => handleCategoryClick('all')}
              className="w-full px-6 py-3 text-left bg-[#FF6B6B] text-white hover:bg-[#ff5252] transition-colors"
            >
              SHOP ALL
            </button>
          </div>
        )}
      </div>

      {/* Desktop Filter */}
      <div className="hidden sm:flex sm:items-center gap-4">
        <span className="text-gray-600 font-medium">SHOP BY:</span>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#8B7355] text-white'
                  : 'bg-[#E8E0D4] text-[#8B7355] hover:bg-[#8B7355] hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
          <button 
            onClick={() => handleCategoryClick('all')}
            className="bg-[#FF6B6B] text-white px-6 py-2 rounded-full font-medium hover:bg-[#ff5252] transition-colors"
          >
            SHOP ALL
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const { addToCart } = useCart();
  const { openCart } = useCartUI();
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  useEffect(() => {
    if (product?.variants?.edges?.[0]?.node) {
      setSelectedVariant(product.variants.edges[0].node);
      // Check if all variants are out of stock
      setIsOutOfStock(!product.variants.edges.some(edge => edge.node.quantityAvailable > 0));
    }
  }, [product]);

  useEffect(() => {
    if (selectedVariant) {
      // Update out of stock status when variant changes
      setIsOutOfStock(selectedVariant.quantityAvailable <= 0);
    }
  }, [selectedVariant]);

  if (!product || !selectedVariant) return null;

  const formatPrice = (price: MoneyV2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD',
    }).format(parseFloat(price.amount));
  };

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.quantityAvailable > 0) {
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
    const [first, ...rest] = title.split(' ');
    return (
      <>
        <span className="font-black">{first}</span>
        {rest.length ? <span className="font-medium text-[11px] sm:text-base text-gray-700">{' ' + rest.join(' ')}</span> : ''}
      </>
    );
  };

  return (
    <div className={`rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-[#F2F7F2] transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm ${isOutOfStock ? 'opacity-70' : ''}`}>
      {product.isBestSeller && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#FF6B6B] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold z-10">
          Best Seller
        </div>
      )}
      {isOutOfStock && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold z-10">
          Out of Stock
        </div>
      )}
      <Link href={`/product/${product.handle}`} className="relative h-[140px] sm:h-[280px] flex-grow mb-2 sm:mb-4">
        <Image
          src={product.featuredImage?.url || '/placeholder.png'}
          alt={product.featuredImage?.altText || product.title}
          fill
          className={`object-contain mix-blend-multiply ${isOutOfStock ? 'grayscale' : ''}`}
          sizes="(max-width: 640px) 140px, (max-width: 768px) 280px, 300px"
          priority
        />
      </Link>
      <div className="flex flex-col justify-end space-y-1.5 sm:space-y-2">
        <div className="flex items-center mb-0.5 sm:mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 ${isOutOfStock ? 'text-gray-400' : 'text-[#FF6B6B]'} fill-current`} viewBox="0 0 20 20">
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
              className={`w-full appearance-none bg-white rounded-l-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2.5 border border-r-0 border-gray-200 text-[11px] sm:text-sm focus:outline-none ${isOutOfStock ? 'text-gray-400' : 'focus:border-[#FF6B6B]'}`}
              value={selectedVariant.id}
              onChange={(e) => {
                const variant = product.variants.edges.find(v => v.node.id === e.target.value)?.node;
                if (variant) setSelectedVariant(variant);
              }}
            >
              {product.variants.edges?.map(({ node }) => (
                <option key={node.id} value={node.id} disabled={node.quantityAvailable <= 0}>
                  {node.selectedOptions?.map(opt => opt.value).join(' - ')}{node.quantityAvailable <= 0 ? ' - Out of stock' : ''}
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
            <span className={`text-[11px] sm:text-sm font-medium ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
              {formatPrice(selectedVariant.price)}
            </span>
          </div>
          <button 
            className={`w-[25%] py-1.5 sm:py-2.5 rounded-r-full flex items-center justify-center ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF6B6B] hover:bg-[#ff5252] transition-colors'}`}
            disabled={isOutOfStock || selectedVariant.quantityAvailable <= 0}
            onClick={handleAddToCart}
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
          >
            <ShoppingCartIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ title, image }: { title: string; image: string }) => (
  <>
    {/* Mobile Category Header */}
    <div className="block sm:hidden w-full rounded-2xl overflow-hidden relative">
      <div className="relative aspect-[2/1]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4">
          <p className="text-white text-sm mb-1">Grow beautiful</p>
          <h3 className="text-white text-2xl font-bold">{title}</h3>
        </div>
      </div>
    </div>

    {/* Desktop Category Card */}
    <div className="hidden sm:block relative rounded-3xl overflow-hidden bg-[#2C3E50] h-full min-h-[400px] group">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
        priority
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="mb-4">
          <p className="text-sm mb-2">Grow beautiful</p>
          <h3 className="text-3xl font-bold">{title}</h3>
        </div>
      </div>
    </div>
  </>
);

const ProductSection = ({ title, products, id }: { title: string; products: Product[]; id: string }) => {
  if (!products || products.length === 0) return null;

  // Get category image based on title
  const getCategoryImage = (title: string) => {
    switch (title.toLowerCase()) {
      case 'houseplants':
        return '/assets/categories/houseplants.jpg';
      case 'lawn and garden':
        return '/assets/categories/garden.jpg';
      case 'hydro & aquatic':
        return '/assets/categories/hydro.jpg';
      case 'specialty supplements':
        return '/assets/categories/supplements.jpg';
      default:
        return '/assets/categories/default.jpg';
    }
  };

  return (
    <div id={id} className="space-y-4 sm:space-y-8 scroll-mt-16 sm:scroll-mt-24">
      {/* Title section - Only show on desktop */}
      <div className="hidden sm:flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        <Link href={`/category/${id}`} className="text-[#FF6B6B] hover:text-[#ff5252] flex items-center space-x-1 sm:space-x-2">
          <span className="text-sm sm:text-base">View All</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Mobile Category Banner */}
      <div className="block sm:hidden">
        <CategoryCard title={title} image={getCategoryImage(title)} />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Desktop Category Card - First position */}
        <div className="hidden sm:block col-span-1">
          <CategoryCard title={title} image={getCategoryImage(title)} />
        </div>

        {/* Product Cards - Show exactly 6 products */}
        {products.slice(0, 6).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* See All Card - Only shown on desktop */}
        <div className="hidden sm:block col-span-1">
          <Link href={`/category/${id}`}>
            <div className="rounded-3xl bg-[#F8F9FA] h-full min-h-[400px] flex flex-col items-center justify-center p-6 transition-colors hover:bg-[#E9ECEF] group">
              <span className="text-lg font-medium text-gray-600 mb-2">SEE ALL</span>
              <span className="text-sm text-gray-500 uppercase">{title}</span>
              <svg className="w-6 h-6 text-gray-400 mt-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile View All link */}
      <div className="flex sm:hidden justify-center mt-6">
        <Link 
          href={`/category/${id}`}
          className="bg-[#FF6B6B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#ff5252] transition-colors inline-flex items-center space-x-2"
        >
          <span>View All {title}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
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

      // Mark best sellers and categorize products
      const productsWithBestSellers = markBestSellers(allProducts);
      setProducts(productsWithBestSellers);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Scroll to category on initial load if category is in URL
  useEffect(() => {
    if (selectedCategory && !loading) {
      const element = document.getElementById(selectedCategory);
      if (element) {
        const navbarHeight = 88;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navbarHeight - 24,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedCategory, loading]);

  const markBestSellers = (products: Product[]) => {
    const seededRandom = (seed: number) => {
      return function() {
        seed = Math.sin(seed) * 10000;
        return seed - Math.floor(seed);
      };
    };

    return products.map(product => {
      const random = seededRandom(parseInt(product.id.replace(/\D/g, ''), 10))();
      return {
        ...product,
        isBestSeller: random < 0.2,
        popularityScore: random
      };
    });
  };

  const filterProducts = (products: Product[], category: string, query: string) => {
    let filtered = products;

    // Apply category filter
    if (category !== 'all') {
      const categoryList = {
        'houseplants': houseplantsList,
        'garden-plants': gardenPlantsList,
        'hydro-aquatic': hydroAquaticList,
        'supplements': supplementsList,
      }[category] || [];

      filtered = products.filter(product => 
        categoryList.some(item => {
          const productTitle = product.title.trim();
          return productTitle === item || productTitle.includes(item);
        })
      );
    }

    // Apply search filter if query exists
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = products.filter(product => 
        searchTerms.every(term => 
          product.title.toLowerCase().includes(term) ||
          product.variants.edges.some(edge => 
            edge.node.title.toLowerCase().includes(term)
          )
        )
      );
    } 
    // If no search query, hide out of stock products
    else {
      filtered = filtered.filter(product => 
        product.variants.edges.some(edge => edge.node.quantityAvailable > 0)
      );
    }

    // Sort by popularity (descending)
    filtered.sort((a, b) => {
      // Use the popularityScore property if available, otherwise use reviews count
      const scoreA = a.popularityScore !== undefined ? a.popularityScore : (a.reviews || 0)/1000;
      const scoreB = b.popularityScore !== undefined ? b.popularityScore : (b.reviews || 0)/1000;
      return scoreB - scoreA;
    });

    return filtered;
  };

  const getCategoryProducts = (category: string) => {
    return filterProducts(products, category, searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6EF] flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF6EF] flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <main className="bg-[#FDF6EF]">
      {/* Hero Section */}
      <section className="w-full bg-[#FDF6EF] py-4 sm:py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Mobile Hero */}
          <div className="block sm:hidden">
            <div className="relative rounded-2xl overflow-hidden bg-[#F2F7F2] mb-4">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/assets/shop-banner.jpg"
                  alt="TPS Plant Food Products"
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
              </div>
            </div>
            <div className="bg-[#FF6B6B] rounded-2xl p-6 text-center">
              <h1 className="text-3xl font-bold text-white">
                THE PLANT SHOP
              </h1>
            </div>
          </div>

          {/* Desktop Hero */}
          <div className="hidden sm:flex relative h-[400px] w-full rounded-3xl overflow-hidden">
            <div className="flex-grow relative">
              <Image
                src="/assets/shop-banner.jpg"
                alt="TPS Plant Shop Banner"
                fill
                className="object-cover"
                priority
                quality={100}
              />
            </div>
            <div className="w-[400px] bg-[#FF6B6B] flex items-center justify-center p-12">
              <div className="text-white">
                <h1 className="text-5xl font-bold mb-2">THE</h1>
                <h1 className="text-5xl font-bold mb-2">PLANT</h1>
                <h1 className="text-5xl font-bold">SHOP</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="space-y-16 sm:space-y-24">
          <ProductSection
            id="houseplants"
            title="Houseplants"
            products={getCategoryProducts('houseplants')}
          />
          <ProductSection
            id="garden-plants"
            title="Lawn and Garden"
            products={getCategoryProducts('garden-plants')}
          />
          <ProductSection
            id="hydro-aquatic"
            title="Hydro & Aquatic"
            products={getCategoryProducts('hydro-aquatic')}
          />
          <ProductSection
            id="supplements"
            title="Specialty Supplements"
            products={getCategoryProducts('supplements')}
          />
        </div>
      </section>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}