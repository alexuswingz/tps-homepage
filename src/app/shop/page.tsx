"use client";

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

const CategoryFilter = ({ selectedCategory, onCategoryChange }: { 
  selectedCategory: string; 
  onCategoryChange: (category: string) => void;
}) => {
  const categories = [
    { id: 'houseplants', label: 'HOUSEPLANTS', color: 'bg-[#F4D03F]' },
    { id: 'garden-plants', label: 'GARDEN PLANTS', color: 'bg-[#52BE80]' },
    { id: 'hydro-aquatic', label: 'HYDRO & AQUATIC', color: 'bg-[#5DADE2]' },
    { id: 'supplements', label: 'SUPPLEMENTS', color: 'bg-[#D7BDE2]' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const navbarHeight = 88; // Adjust based on your navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navbarHeight - 24, // Added 24px padding
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8">
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
  );
};

const ProductCard = ({ product }: { product: Product }) => {
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
    const [first, ...rest] = title.split(' ');
    return (
      <>
        <span className="font-black">{first}</span>
        {rest.length ? <span className="font-medium text-base text-gray-700">{' ' + rest.join(' ')}</span> : ''}
      </>
    );
  };

  return (
    <div className={`rounded-3xl p-5 bg-[#F2F7F2] transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm`}>
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

const ProductSection = ({ title, products, id }: { title: string; products: Product[]; id: string }) => {
  const [visibleProducts, setVisibleProducts] = useState(8); // Show 8 products initially
  
  if (!products || products.length === 0) return null;

  const showMoreProducts = () => {
    setVisibleProducts(prev => prev + 8); // Show 8 more products when clicking "Show More"
  };

  return (
    <div id={id} className="space-y-8 scroll-mt-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link href={`/shop?category=${id}`} className="text-[#FF6B6B] hover:text-[#ff5252] flex items-center space-x-2">
          <span>View All</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, visibleProducts).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {visibleProducts < products.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={showMoreProducts}
            className="bg-[#8B7355] text-white px-8 py-3 rounded-full font-medium hover:bg-[#7a6548] transition-colors"
          >
            Show More {title}
          </button>
        </div>
      )}
    </div>
  );
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'houseplants');
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

  const getCategoryProducts = (category: string) => {
    const categoryList = {
      'houseplants': houseplantsList,
      'garden-plants': gardenPlantsList,
      'hydro-aquatic': hydroAquaticList,
      'supplements': supplementsList,
    }[category] || [];

    return products.filter(product => 
      categoryList.some(item => {
        const productTitle = product.title.trim();
        return productTitle === item || productTitle.includes(item);
      })
    );
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
      <section className="w-full bg-[#FDF6EF] py-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative h-[400px] w-full rounded-3xl overflow-hidden flex">
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
      <section className="max-w-[1400px] mx-auto px-6 py-12">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="space-y-24">
          <ProductSection
            id="houseplants"
            title="Houseplants"
            products={getCategoryProducts('houseplants')}
          />
          <ProductSection
            id="garden-plants"
            title="Garden Plants"
            products={getCategoryProducts('garden-plants')}
          />
          <ProductSection
            id="hydro-aquatic"
            title="Hydro & Aquatic"
            products={getCategoryProducts('hydro-aquatic')}
          />
          <ProductSection
            id="supplements"
            title="Supplements"
            products={getCategoryProducts('supplements')}
          />
        </div>
      </section>
    </main>
  );
}