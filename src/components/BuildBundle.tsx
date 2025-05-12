"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCartUI } from '@/app/template';
import { shopifyFetch } from '@/lib/shopify';
import { toast } from 'react-hot-toast';

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
  category?: string;
}

interface SelectedProduct {
  product: Product;
  variant: Variant;
  quantity: number;
}

const BuildBundle = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('HOUSEPLANTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const { addToCart } = useCart();
  const { openCart } = useCartUI();

  // Fetch products
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
              isBestSeller: Math.random() > 0.8
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

      // Categorize products based on title
      const categorizedProducts = allProducts.map(product => {
        let category = 'ALL';
        const title = product.title.toLowerCase();
        
        if (title.includes('monstera') || title.includes('fiddle leaf') || 
            title.includes('indoor') || title.includes('succulent') ||
            title.includes('houseplant') || title.includes('snake plant')) {
          category = 'HOUSEPLANTS';
        } else if (title.includes('garden') || title.includes('tomato') || 
                  title.includes('flower') || title.includes('rose') ||
                  title.includes('vegetable') || title.includes('strawberry')) {
          category = 'GARDEN PLANTS';
        } else if (title.includes('hydro') || title.includes('aquatic') || 
                  title.includes('water') || title.includes('lotus')) {
          category = 'HYDRO & AQUATIC';
        } else if (title.includes('supplement') || title.includes('calcium') || 
                  title.includes('nutrient') || title.includes('magnesium') ||
                  title.includes('silica')) {
          category = 'SUPPLEMENT';
        }
        
        return { ...product, category };
      });

      setProducts(categorizedProducts);
      setLoading(false);
    };

    fetchAllProducts();
  }, []);

  // Filter products by category and search
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (activeCategory !== 'ALL') {
      filtered = products.filter(product => product.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [activeCategory, searchQuery, products]);

  const formatPrice = (price: MoneyV2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD',
    }).format(parseFloat(price.amount));
  };

  const handleAddToBundle = (product: Product) => {
    // First, check if the product has stock available
    const variant = product.variants.edges[0].node;
    if (variant.quantityAvailable <= 0) {
      toast.error(`Sorry, ${product.title} is out of stock`);
      return;
    }

    // Check if product is already in the bundle
    const existingIndex = selectedProducts.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      // Product exists, increment quantity
      const updatedProducts = [...selectedProducts];
      const newQuantity = updatedProducts[existingIndex].quantity + 1;
      
      // Check if we have enough stock for the requested quantity
      if (variant.quantityAvailable < newQuantity) {
        toast.error(`Sorry, only ${variant.quantityAvailable} units of ${product.title} available`);
        return;
      }
      
      // Calculate total quantity including this new addition
      const totalQuantity = totalProductCount() + 1;
      
      if (totalQuantity > 3) {
        toast.error('Bundle is limited to 3 total products!');
        return;
      }
      
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        quantity: newQuantity
      };
      
      setSelectedProducts(updatedProducts);
      toast.success(`Added another ${product.title} to your bundle!`);
      return;
    }
    
    // If adding a new product would exceed the limit of 3 total products
    if (totalProductCount() >= 3) {
      toast.error('Bundle is full! Remove a product first.');
      return;
    }
    
    setSelectedProducts([...selectedProducts, {
      product,
      variant,
      quantity: 1
    }]);
    
    toast.success(`${product.title} added to your bundle!`);
  };

  const handleRemoveFromBundle = (index: number) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts.splice(index, 1);
    setSelectedProducts(newSelectedProducts);
    toast.success('Product removed from bundle');
  };

  const handleUpdateQuantity = (index: number, change: number) => {
    const newSelectedProducts = [...selectedProducts];
    const newQuantity = newSelectedProducts[index].quantity + change;
    
    // Check if we have enough stock for the requested quantity
    const variant = newSelectedProducts[index].variant;
    if (newQuantity > variant.quantityAvailable) {
      toast.error(`Sorry, only ${variant.quantityAvailable} units of ${newSelectedProducts[index].product.title} available`);
      return;
    }
    
    // Calculate what the new total would be
    const currentTotal = totalProductCount();
    const newTotal = currentTotal + change;
    
    // Don't let total go above 3
    if (newTotal > 3) {
      toast.error('Bundle is limited to 3 total products!');
      return;
    }
    
    if (newQuantity < 1) {
      // If quantity becomes less than 1, remove the product
      handleRemoveFromBundle(index);
      return;
    }
    
    newSelectedProducts[index] = {
      ...newSelectedProducts[index],
      quantity: newQuantity
    };
    
    setSelectedProducts(newSelectedProducts);
  };

  const totalProductCount = () => {
    return selectedProducts.reduce((count, item) => count + item.quantity, 0);
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, item) => {
      const price = parseFloat(item.variant.price.amount);
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateDiscountedPrice = () => {
    const totalPrice = calculateTotalPrice();
    // Apply $10 discount if there are exactly 3 products in total
    return totalPrice - (totalProductCount() === 3 ? 10 : 0);
  };

  const handleAddBundleToCart = () => {
    if (totalProductCount() !== 3) {
      toast.error('Please select exactly 3 products to complete your bundle');
      return;
    }

    // Check stock availability for all products
    for (const item of selectedProducts) {
      if (item.variant.quantityAvailable < item.quantity) {
        toast.error(`Sorry, only ${item.variant.quantityAvailable} units of ${item.product.title} available`);
        return;
      }
    }

    try {
      // Add each product to cart with its quantity
      selectedProducts.forEach(({ product, variant, quantity }) => {
        // Create the item with the correct quantity
        const item = {
          variantId: variant.id,
          productId: product.id,
          title: product.title,
          variantTitle: variant.selectedOptions?.map(opt => opt.value).join(' - ') || '',
          price: variant.price,
          image: product.featuredImage,
          quantity: quantity, // Ensure quantity is explicitly set
        };
        
        // Log to console for debugging
        console.log(`Adding to cart: ${item.title}, quantity: ${item.quantity}`);
        
        // Add to cart
        addToCart(item);
      });
      
      // Open cart and show success message
      openCart();
      
      // Calculate total items and savings
      const totalItems = totalProductCount();
      const savings = calculateTotalPrice() - calculateDiscountedPrice();
      
      toast.success(`Bundle with ${totalItems} items added to cart! You saved $${savings.toFixed(2)}`);
    } catch (error) {
      console.error('Error adding bundle to cart:', error);
      toast.error('There was an error adding your bundle to cart. Please try again.');
    }
  };

  // Update button state to reflect stock availability
  const isOutOfStock = (product: Product) => {
    return product.variants.edges[0].node.quantityAvailable <= 0;
  };

  return (
    <div className="bg-[#FDF6EF] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Bundle</h1>
          <p className="text-lg text-gray-600">Make a bundle of 3 or 5!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bundle summary - Moved to top for mobile */}
          <div className="w-full lg:w-4/12 order-1 lg:order-2 h-fit lg:sticky lg:top-4 mb-8 lg:mb-0">
            <div className="bg-[#F8F3E3] border border-[#D9D0BA] rounded-3xl p-6 shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-[#4A3520] mb-1">Your Bundle</h2>
                {totalProductCount() === 3 && (
                  <div className="font-semibold text-lg">
                    <span className="text-black mr-2">${calculateDiscountedPrice().toFixed(2)}</span>
                    <span className="text-gray-500 line-through">${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-5 mb-6">
                {selectedProducts.map((selectedProduct, index) => (
                  <div 
                    key={index} 
                    className="flex items-start border border-dashed border-[#83735A] p-3 rounded-md"
                  >
                    <div className="relative h-20 w-20 bg-white rounded-md mr-3 flex-shrink-0 p-1">
                      <Image 
                        src={selectedProduct.product.featuredImage?.url || '/placeholder-product.png'} 
                        alt={selectedProduct.product.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm uppercase text-[#4A3520] leading-tight">
                        {selectedProduct.product.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">Hydration - Immunity</p>
                      <p className="font-semibold text-sm">${parseFloat(selectedProduct.variant.price.amount).toFixed(2)}</p>
                      
                      {/* Quantity control */}
                      <div className="flex items-center mt-2">
                        <button 
                          onClick={() => handleUpdateQuantity(index, -1)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="mx-2 text-sm font-medium">{selectedProduct.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(index, 1)}
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          disabled={totalProductCount() >= 3 || selectedProduct.quantity >= selectedProduct.variant.quantityAvailable}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromBundle(index)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                      aria-label="Remove from bundle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Show "Add product" message only if total is less than 3 */}
                {totalProductCount() < 3 && (
                  <div 
                    className="flex items-center justify-center h-20 border border-dashed border-[#83735A] rounded-md bg-white/50 opacity-70"
                  >
                    <span className="text-gray-400 text-sm">
                      Add {3 - totalProductCount()} more product{3 - totalProductCount() !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="rounded-full border border-[#D9D0BA] bg-white py-3 px-4 text-center mb-4">
                <span className="font-semibold">{totalProductCount()}/3 TOTAL ITEMS</span>
              </div>
              
              <button 
                onClick={handleAddBundleToCart}
                disabled={totalProductCount() !== 3}
                className={`w-full py-3 rounded-full text-white font-semibold text-lg transition-colors mb-2 ${
                  totalProductCount() === 3 
                    ? 'bg-[#F33A6A] hover:bg-[#e02d5d]' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                ADD TO BAG - ${totalProductCount() === 3 ? calculateDiscountedPrice().toFixed(2) : '0.00'} 
                {totalProductCount() === 3 && <span className="line-through ml-1 text-gray-200 text-base">${calculateTotalPrice().toFixed(2)}</span>}
              </button>
              
              {totalProductCount() === 3 && (
                <p className="text-center text-[#4A3520] font-medium text-sm">WOOHOO! YOU'RE SAVING $10.</p>
              )}
            </div>
          </div>

          {/* Products section */}
          <div className="w-full lg:w-8/12 order-2 lg:order-1">
            {/* Search and category filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="text-lg font-semibold mb-2 sm:mb-0">SHOP BY:</div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'HOUSEPLANTS' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'}`}
                    onClick={() => setActiveCategory('HOUSEPLANTS')}
                  >
                    HOUSEPLANTS
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'GARDEN PLANTS' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'}`}
                    onClick={() => setActiveCategory('GARDEN PLANTS')}
                  >
                    GARDEN PLANTS
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'HYDRO & AQUATIC' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'}`}
                    onClick={() => setActiveCategory('HYDRO & AQUATIC')}
                  >
                    HYDRO & AQUATIC
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm ${activeCategory === 'SUPPLEMENT' ? 'bg-[#8B7355] text-white' : 'bg-[#E8E0D4] text-[#8B7355]'}`}
                    onClick={() => setActiveCategory('SUPPLEMENT')}
                  >
                    SUPPLEMENT
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <input 
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            {/* Popular houseplants section - With carousel for mobile */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-4 uppercase">Popular {activeCategory.toLowerCase()}</h2>
              
              {/* Mobile carousel view */}
              <div className="block md:hidden relative">
                <div className="overflow-x-auto flex gap-4 pb-4 snap-x scrollbar-hide">
                  {loading ? (
                    <div className="flex-shrink-0 w-full text-center py-12">
                      <p>Loading products...</p>
                    </div>
                  ) : error ? (
                    <div className="flex-shrink-0 w-full text-center py-12">
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="flex-shrink-0 w-full text-center py-12">
                      <p>No products found. Try a different search or category.</p>
                    </div>
                  ) : (
                    filteredProducts.slice(0, 6).map((product) => (
                      <div 
                        key={product.id} 
                        className="flex-shrink-0 w-[250px] snap-start bg-white rounded-lg overflow-hidden"
                      >
                        <div className="relative">
                          <div className="bg-green-50 pt-4 px-4">
                            <div className="relative h-40 w-full">
                              <Image 
                                src={product.featuredImage?.url || '/placeholder-product.png'} 
                                alt={product.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                          {product.isBestSeller && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              BEST SELLER!
                            </div>
                          )}
                          {isOutOfStock(product) && (
                            <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                              OUT OF STOCK
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center mb-1">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500">{product.reviews} reviews</span>
                          </div>
                          
                          <h3 className="font-bold uppercase mb-1">{product.title}</h3>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <span className="text-sm font-bold">8 Ounces</span>
                              <span className="mx-2 text-sm text-gray-600">|</span>
                              <span className="text-sm font-semibold">{formatPrice(product.variants.edges[0].node.price)}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleAddToBundle(product)}
                            className={`w-full py-2 rounded-full text-sm uppercase font-medium 
                              ${selectedProducts.some(item => item.product.id === product.id) 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : isOutOfStock(product)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'} transition-colors`}
                            disabled={totalProductCount() >= 3 || selectedProducts.some(item => item.product.id === product.id) || isOutOfStock(product)}
                          >
                            {selectedProducts.some(item => item.product.id === product.id) 
                              ? 'ADDED TO BUNDLE' 
                              : isOutOfStock(product)
                              ? 'OUT OF STOCK'
                              : 'ADD TO BUNDLE'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <style jsx global>{`
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              </div>
              
              {/* Desktop grid view */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <p>Loading products...</p>
                  </div>
                ) : error ? (
                  <div className="col-span-full flex justify-center py-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full flex justify-center py-12">
                    <p>No products found. Try a different search or category.</p>
                  </div>
                ) : (
                  filteredProducts.slice(0, 6).map((product) => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden">
                      <div className="relative">
                        <div className="bg-green-50 pt-4 px-4">
                          <div className="relative h-40 w-full">
                            <Image 
                              src={product.featuredImage?.url || '/placeholder-product.png'} 
                              alt={product.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                        {product.isBestSeller && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            BEST SELLER!
                          </div>
                        )}
                        {isOutOfStock(product) && (
                          <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                            OUT OF STOCK
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center mb-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">{product.reviews} reviews</span>
                        </div>
                        
                        <h3 className="font-bold uppercase mb-1">{product.title}</h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-sm font-bold">8 Ounces</span>
                            <span className="mx-2 text-sm text-gray-600">|</span>
                            <span className="text-sm font-semibold">{formatPrice(product.variants.edges[0].node.price)}</span>
                          </div>
                          <button className="text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToBundle(product)}
                          className={`w-full py-2 rounded-full text-sm uppercase font-medium 
                            ${selectedProducts.some(item => item.product.id === product.id) 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : isOutOfStock(product)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'} transition-colors`}
                          disabled={totalProductCount() >= 3 || selectedProducts.some(item => item.product.id === product.id) || isOutOfStock(product)}
                        >
                          {selectedProducts.some(item => item.product.id === product.id) 
                            ? 'ADDED TO BUNDLE' 
                            : isOutOfStock(product)
                            ? 'OUT OF STOCK'
                            : 'ADD TO BUNDLE'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Display other categories if viewing ALL category or searching */}
            {(activeCategory === 'ALL' || searchQuery.trim()) && (
              <>
                {/* Display sections for each category */}
                {['HOUSEPLANTS', 'GARDEN PLANTS', 'HYDRO & AQUATIC', 'SUPPLEMENT'].map(category => {
                  // Skip the active category since we already displayed it above
                  if (category === activeCategory && !searchQuery.trim()) return null;
                  
                  // Get products for this category
                  let categoryProducts = products.filter(p => p.category === category);
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim();
                    categoryProducts = categoryProducts.filter(p => 
                      p.title.toLowerCase().includes(query)
                    );
                  }
                  
                  // Skip if no products
                  if (categoryProducts.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-12">
                      <h2 className="text-xl font-bold mb-4 uppercase">{category.toLowerCase().replace('_', ' ')}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryProducts.slice(0, 3).map((product) => (
                          <div key={product.id} className="bg-white rounded-lg overflow-hidden">
                            <div className="relative">
                              <div className="bg-green-50 pt-4 px-4">
                                <div className="relative h-40 w-full">
                                  <Image 
                                    src={product.featuredImage?.url || '/placeholder-product.png'} 
                                    alt={product.title}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                              {product.isBestSeller && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                  BEST SELLER!
                                </div>
                              )}
                              {isOutOfStock(product) && (
                                <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                                  OUT OF STOCK
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-center mb-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="ml-1 text-xs text-gray-500">{product.reviews} reviews</span>
                              </div>
                              
                              <h3 className="font-bold uppercase mb-1">{product.title}</h3>
                              
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <span className="text-sm font-bold">8 Ounces</span>
                                  <span className="mx-2 text-sm text-gray-600">|</span>
                                  <span className="text-sm font-semibold">{formatPrice(product.variants.edges[0].node.price)}</span>
                                </div>
                                <button className="text-gray-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => handleAddToBundle(product)}
                                className={`w-full py-2 rounded-full text-sm uppercase font-medium 
                                  ${selectedProducts.some(item => item.product.id === product.id) 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : isOutOfStock(product)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'} transition-colors`}
                                disabled={totalProductCount() >= 3 || selectedProducts.some(item => item.product.id === product.id) || isOutOfStock(product)}
                              >
                                {selectedProducts.some(item => item.product.id === product.id) 
                                  ? 'ADDED TO BUNDLE' 
                                  : isOutOfStock(product)
                                  ? 'OUT OF STOCK'
                                  : 'ADD TO BUNDLE'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            
            {/* If not ALL or search, show a second section for dry climate plants or popular combinations */}
            {!searchQuery.trim() && activeCategory !== 'ALL' && (
              <div className="mb-12">
                <h2 className="text-xl font-bold mb-4 uppercase">Popular Combinations</h2>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {!loading && !error && filteredProducts.slice(6, 12).map((product) => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden">
                      <div className="relative">
                        <div className="bg-green-50 pt-4 px-4">
                          <div className="relative h-40 w-full">
                            <Image 
                              src={product.featuredImage?.url || '/placeholder-product.png'} 
                              alt={product.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                        {product.isBestSeller && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            BEST SELLER!
                          </div>
                        )}
                        {isOutOfStock(product) && (
                          <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                            OUT OF STOCK
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center mb-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">{product.reviews} reviews</span>
                        </div>
                        
                        <h3 className="font-bold uppercase mb-1">{product.title}</h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-sm font-bold">8 Ounces</span>
                            <span className="mx-2 text-sm text-gray-600">|</span>
                            <span className="text-sm font-semibold">{formatPrice(product.variants.edges[0].node.price)}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToBundle(product)}
                          className={`w-full py-2 rounded-full text-sm uppercase font-medium 
                            ${selectedProducts.some(item => item.product.id === product.id) 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : isOutOfStock(product)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'} transition-colors`}
                          disabled={totalProductCount() >= 3 || selectedProducts.some(item => item.product.id === product.id) || isOutOfStock(product)}
                        >
                          {selectedProducts.some(item => item.product.id === product.id) 
                            ? 'ADDED TO BUNDLE' 
                            : isOutOfStock(product)
                            ? 'OUT OF STOCK'
                            : 'ADD TO BUNDLE'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Mobile carousel view for Popular Combinations */}
                <div className="block md:hidden relative">
                  <div className="overflow-x-auto flex gap-4 pb-4 snap-x scrollbar-hide">
                    {!loading && !error && filteredProducts.slice(6, 12).map((product) => (
                      <div 
                        key={product.id} 
                        className="flex-shrink-0 w-[250px] snap-start bg-white rounded-lg overflow-hidden"
                      >
                        <div className="relative">
                          <div className="bg-green-50 pt-4 px-4">
                            <div className="relative h-40 w-full">
                              <Image 
                                src={product.featuredImage?.url || '/placeholder-product.png'} 
                                alt={product.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                          {product.isBestSeller && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              BEST SELLER!
                            </div>
                          )}
                          {isOutOfStock(product) && (
                            <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                              OUT OF STOCK
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center mb-1">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500">{product.reviews} reviews</span>
                          </div>
                          
                          <h3 className="font-bold uppercase mb-1">{product.title}</h3>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <span className="text-sm font-bold">8 Ounces</span>
                              <span className="mx-2 text-sm text-gray-600">|</span>
                              <span className="text-sm font-semibold">{formatPrice(product.variants.edges[0].node.price)}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleAddToBundle(product)}
                            className={`w-full py-2 rounded-full text-sm uppercase font-medium 
                              ${selectedProducts.some(item => item.product.id === product.id) 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : isOutOfStock(product)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'} transition-colors`}
                            disabled={totalProductCount() >= 3 || selectedProducts.some(item => item.product.id === product.id) || isOutOfStock(product)}
                          >
                            {selectedProducts.some(item => item.product.id === product.id) 
                              ? 'ADDED TO BUNDLE' 
                              : isOutOfStock(product)
                              ? 'OUT OF STOCK'
                              : 'ADD TO BUNDLE'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildBundle; 