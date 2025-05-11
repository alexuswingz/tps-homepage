"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCartUI } from '@/app/template';
import { StarIcon } from '@heroicons/react/24/solid';
import ShopByPlant from "@/components/ShopByPlant";
import PlantCare from "@/components/PlantCare";
import BuyThreePromo from '@/components/BuyThreePromo';
import WhyTPS from '@/components/WhyTPS';
import Reviews from '@/components/Reviews';

interface ProductData {
  title: string;
  category: string;
  subcategory: string;
  rating: number;
  totalReviews: number;
  price: number;
  description: string;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    inStock: boolean;
  }>;
  bundles: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
  }>;
  subscription: {
    oneTime: { price: number };
    recurring: { price: number; frequency: string };
  };
  featuredImage: string;
  images: Array<{
    url: string;
    altText: string;
  }>;
  isBestSeller: boolean;
}

interface ProductClientProps {
  product: ProductData;
}

const ProductClient = ({ product }: ProductClientProps) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'oneTime' | 'recurring'>('oneTime');
  const { addToCart } = useCart();
  const { openCart } = useCartUI();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    
    const variant = product.variants.find(v => v.id === selectedVariant);
    if (!variant) return;

    const item = {
      variantId: variant.id,
      productId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: {
        amount: variant.price.toString(),
        currencyCode: 'USD'
      },
      image: {
        url: product.featuredImage,
        altText: product.title
      },
      quantity: quantity
    };

    addToCart(item);
    openCart();
  };

  return (
    <main className="bg-[#FDF6EF]">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-2 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/shop" className="text-gray-600 hover:text-gray-900">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#FF6B6B]">{product.title}</span>
        </div>
      </div>

      {/* Product Hero Section */}
      <section className="w-full bg-[#FDF6EF]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Product Images */}
            <div className="relative">
              {product.isBestSeller && (
                <div className="absolute top-4 left-4 z-10 bg-[#FF6B6B] text-white px-3 py-1 rounded-full text-sm font-medium">
                  BEST SELLER
                </div>
              )}
              <div className="relative aspect-square bg-[#F2F7F2] rounded-3xl overflow-hidden">
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.title}
                  fill
                  className={`object-contain p-8 transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onLoadingComplete={() => setIsImageLoaded(true)}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg=="
                />
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B6B]"></div>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-xl bg-[#F2F7F2] p-2 hover:bg-gray-100 ${
                        selectedImage === index ? 'ring-2 ring-[#FF6B6B]' : ''
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.url}
                          alt={image.altText || `${product.title} - View ${index + 1}`}
                          fill
                          className="object-contain"
                          loading="lazy"
                          sizes="(max-width: 768px) 60px, 100px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">{product.category} · {product.subcategory}</div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-[#FF6B6B]' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-[#FF6B6B] font-medium">{product.rating} out of 5</span>
                  <span className="ml-2 text-gray-500">({product.totalReviews} global ratings)</span>
                </div>

                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">SELECT SIZE</h3>
                  <span className="text-[#FF6B6B] text-sm">* Some options may be out of stock</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`p-4 rounded-2xl border-2 ${
                        selectedVariant === variant.id
                          ? 'border-[#FF6B6B] bg-[#FFF5F5]'
                          : 'border-gray-200 bg-[#F2F7F2]'
                      } ${!variant.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => variant.inStock && setSelectedVariant(variant.id)}
                      disabled={!variant.inStock}
                    >
                      <div className="text-sm font-medium mb-1">{variant.title}</div>
                      <div className="text-gray-500">${variant.price.toFixed(2)}</div>
                      {!variant.inStock && (
                        <div className="text-gray-500 text-sm mt-1">OUT OF STOCK</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bundle Selection */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                  {product.bundles.map((bundle) => (
                    <div
                      key={bundle.id}
                      className={`p-4 rounded-2xl border-2 ${
                        bundle.id === 'single'
                          ? 'border-[#FF6B6B] bg-[#FFF5F5]'
                          : 'border-gray-200 bg-[#F2F7F2]'
                      }`}
                    >
                      <div className="relative h-24 mb-3">
                        <Image
                          src={bundle.image}
                          alt={bundle.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-sm font-medium mb-1">{bundle.title}</div>
                      <div className="text-[#FF6B6B] font-medium">${bundle.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Options */}
              <div className="mb-8">
                <div className="border-2 border-gray-200 rounded-2xl p-4 bg-[#F2F7F2]">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="purchase-type"
                          value="one-time"
                          defaultChecked
                          className="text-[#FF6B6B] focus:ring-[#FF6B6B]"
                        />
                        <span className="ml-2 font-medium">ONE-TIME PURCHASE</span>
                      </label>
                      <div className="ml-6 text-2xl font-bold text-gray-900">
                        ${product.subscription.oneTime.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="purchase-type"
                          value="subscribe"
                          className="text-[#FF6B6B] focus:ring-[#FF6B6B]"
                        />
                        <span className="ml-2 font-medium">SUBSCRIBE · SAVE!</span>
                      </label>
                      <div className="ml-6">
                        <div className="text-2xl font-bold text-gray-900">
                          ${product.subscription.recurring.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Delivery every {product.subscription.recurring.frequency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.variants.some(v => v.inStock)}
                className="w-full bg-[#FF6B6B] text-white py-4 rounded-full font-medium text-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.variants.some(v => v.inStock) ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Product Information */}
      <section className="w-full bg-[#F2F7F2] py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Plant-Specific Formula</h3>
              <p className="text-gray-600">Tailored nutrients for optimal growth and health of your specific plant type.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simple application process with clear instructions for the best results.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Safe for Indoor Use</h3>
              <p className="text-gray-600">Non-toxic formula that's safe for use around children and pets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buy Three Promo Section */}
      <BuyThreePromo />

      {/* Why TPS Section */}
      <WhyTPS />

      {/* Reviews Section */}
      <Reviews />

      {/* Shop By Plant Section */}
      <ShopByPlant />

      {/* Plant Care Section */}
      <PlantCare />
    </main>
  );
};

export default ProductClient; 