"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { shopifyFetch } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useCartUI } from '@/app/template';

// Import product lists
import { 
  houseplantsList,
  gardenPlantsList,
  hydroAquaticList,
  supplementsList 
} from '@/lib/productLists';

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
    <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-[#F2F7F2] transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm">
      {product.isBestSeller && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#FF6B6B] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold z-10">
          Best Seller
        </div>
      )}
      <Link href={`/product/${product.handle}`} className="relative h-[140px] sm:h-[280px] flex-grow mb-2 sm:mb-4 block">
        <Image
          src={product.featuredImage?.url || '/placeholder.png'}
          alt={product.featuredImage?.altText || product.title}
          fill
          className="object-contain mix-blend-multiply"
          sizes="(max-width: 640px) 140px, (max-width: 768px) 280px, 300px"
          priority
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
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-3 line-clamp-2 leading-tight">
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
                  {node.selectedOptions?.map(opt => opt.value).join(' - ')}
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

const CategoryPage = () => {
  const params = useParams();
  const { category } = params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryTitle = (slug: string) => {
    switch (slug) {
      case 'houseplants':
        return 'HOUSEPLANTS';
      case 'garden-plants':
        return 'GARDEN PLANTS';
      case 'hydro-aquatic':
        return 'HYDRO & AQUATIC';
      case 'supplements':
        return 'SUPPLEMENTS';
      default:
        return 'ALL PRODUCTS';
    }
  };

  const getCategoryList = (slug: string) => {
    switch (slug) {
      case 'houseplants':
        return houseplantsList;
      case 'garden-plants':
        return gardenPlantsList;
      case 'hydro-aquatic':
        return hydroAquaticList;
      case 'supplements':
        return supplementsList;
      default:
        return [];
    }
  };

  const getCategoryImage = (slug: string) => {
    switch (slug) {
      case 'houseplants':
        return '/assets/categories/houseplants.jpg';
      case 'garden-plants':
        return '/assets/categories/garden.jpg';
      case 'hydro-aquatic':
        return '/assets/categories/hydro.jpg';
      case 'supplements':
        return '/assets/categories/supplements.jpg';
      default:
        return '/assets/categories/default.jpg';
    }
  };

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

      // Filter products by category
      const categoryList = getCategoryList(category as string);
      const filteredProducts = categoryList.length > 0
        ? allProducts.filter(product => 
            categoryList.some(item => {
              const productTitle = product.title.trim();
              return productTitle === item || productTitle.includes(item);
            })
          )
        : allProducts;

      // Mark best sellers
      const productsWithBestSellers = filteredProducts.map(product => ({
        ...product,
        isBestSeller: Math.random() < 0.2
      }));

      setProducts(productsWithBestSellers);
      setLoading(false);
    };

    fetchProducts();
  }, [category]);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : products;

  return (
    <main className="bg-[#FDF6EF]">
      {/* Category Hero */}
      <section className="w-full bg-[#FDF6EF] py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {getCategoryTitle(category as string)}
              </h1>
              <p className="text-xl text-gray-600">
                Find the perfect nutrients for your {category === 'supplements' ? 'plants' : category?.toString().replace('-', ' ')}
              </p>
            </div>
            <div className="relative aspect-[16/9] lg:aspect-square rounded-3xl overflow-hidden bg-[#F2F7F2]">
              <Image
                src={getCategoryImage(category as string)}
                alt={getCategoryTitle(category as string)}
                fill
                className="object-cover mix-blend-multiply"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-6 py-3 rounded-full border border-gray-200 pr-12 focus:outline-none focus:border-[#8B7355]"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B6B] mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">No products found</div>
        )}
      </section>
    </main>
  );
};

export default CategoryPage; 