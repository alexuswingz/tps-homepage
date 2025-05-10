"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
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

const ProductPage = () => {
  const params = useParams();
  const { handle } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { openCart } = useCartUI();

  useEffect(() => {
    // In a real app, fetch product data from your API
    // For now, we'll simulate this with mock data
    const mockProduct: Product = {
      id: 'gid://shopify/Product/1',
      title: 'INDOOR PLANT FOOD',
      handle: 'indoor-plant-food',
      category: 'houseplants',
      featuredImage: {
        url: '/assets/products/indoor-plant-food.png',
        altText: 'Indoor Plant Food',
      },
      variants: {
        edges: [
          {
            node: {
              id: 'gid://shopify/ProductVariant/1-1',
              title: '8 Ounces',
              price: { amount: '14.99', currencyCode: 'USD' },
              compareAtPrice: null,
              selectedOptions: [{ name: 'Size', value: '8 Ounces' }],
              quantityAvailable: 10,
            },
          },
        ],
      },
      reviews: 1203,
      isBestSeller: true,
    };

    setProduct(mockProduct);
    setSelectedVariant(mockProduct.variants.edges[0].node);
  }, [handle]);

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#FF6B6B]"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      const item = {
        variantId: selectedVariant.id,
        productId: product.id,
        title: product.title,
        variantTitle: selectedVariant.selectedOptions?.map(opt => opt.value).join(' - ') || '',
        price: selectedVariant.price,
        image: product.featuredImage,
        quantity,
      };
      
      addToCart(item);
      openCart();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EF] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative h-[500px]">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText}
                fill
                className="object-contain"
                priority
              />
              {product.isBestSeller && (
                <div className="absolute top-4 right-4 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-sm font-medium">
                  BEST SELLER!
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FF6B6B] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{product.reviews} reviews</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select 
                    className="w-full bg-white rounded-md px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
                  <span className="text-lg font-medium">Price</span>
                  <span className="text-2xl font-bold">
                    ${(parseFloat(selectedVariant.price.amount) * quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#FF6B6B] text-white py-4 rounded-md font-medium hover:bg-[#ff5252] transition-colors"
                >
                  ADD TO CART
                </button>

                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-medium mb-2">Product Description</h3>
                  <p className="text-gray-600">
                    Our specially formulated plant food is designed to provide optimal nutrition for your indoor plants. 
                    Made with high-quality ingredients, this balanced fertilizer promotes healthy growth, vibrant foliage, 
                    and strong root development.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-4 mb-2">Key Benefits</h3>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Promotes healthy growth and vibrant foliage</li>
                    <li>Strengthens root system</li>
                    <li>Easy to use with clear instructions</li>
                    <li>Safe for all indoor plants</li>
                    <li>Made in the USA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage; 