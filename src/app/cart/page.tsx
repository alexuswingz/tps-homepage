"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, TrashIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { createCheckoutUrl } from '@/lib/shopify';

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartCount,
    discountCode,
    setDiscountCode,
    applyDiscountCode,
    removeDiscountCode,
    hasValidDiscount,
    calculateDiscountedTotal,
    discountAmount
  } = useCart();

  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [inputDiscountCode, setInputDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');

  useEffect(() => {
    // Log cart contents on mount
    console.log('Cart Page - Current cart:', cart);
    console.log('Cart Page - Cart count:', cartCount);
    
    // Check localStorage directly
    if (typeof window !== 'undefined') {
      const rawData = localStorage.getItem('tps_cart_v1');
      console.log('Cart Page - localStorage data:', rawData);
    }

    // Generate checkout URL when cart changes
    const generateCheckoutUrl = async () => {
      if (cart.length > 0) {
        try {
          setIsCheckoutLoading(true);
          const url = await createCheckoutUrl(cart, discountCode);
          if (url) {
            setCheckoutUrl(url);
          }
        } catch (error) {
          console.error('Error generating checkout URL:', error);
        } finally {
          setIsCheckoutLoading(false);
        }
      }
    };

    generateCheckoutUrl();
  }, [cart, cartCount, discountCode]);

  // Handle checkout click
  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!checkoutUrl) {
      e.preventDefault();
      alert('Unable to create checkout. Please try again later.');
    }
    // If we have a URL, let the link work normally
  };

  const formatPrice = (price: { amount: string; currencyCode: string }) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD',
    }).format(parseFloat(price.amount));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + parseFloat(item.price.amount) * item.quantity;
    }, 0);
  };
  
  const calculateProgress = () => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const targetItemCount = 3;
    const remaining = Math.max(0, targetItemCount - totalItems);
    const progress = Math.min(100, (totalItems / targetItemCount) * 100);
    return { progress, remaining, totalItems };
  };
  
  const handleApplyDiscount = () => {
    setDiscountError('');
    if (!inputDiscountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }
    
    const result = applyDiscountCode(inputDiscountCode);
    if (!result.success) {
      setDiscountError(result.errorMessage || 'Invalid discount code');
    } else {
      setInputDiscountCode('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto py-16 px-6 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="mb-8">Looks like you haven't added any products to your cart yet.</p>
        <Link 
          href="/"
          className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-medium hover:bg-[#ff5252] transition-colors inline-flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  const subtotal = calculateTotal();
  const finalTotal = calculateDiscountedTotal(subtotal);
  const { progress, remaining, totalItems } = calculateProgress();

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">Your Cart ({cartCount} items)</h1>
      
      {/* BUY3SAVE10 progress bar */}
      {!hasValidDiscount && remaining > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <p className="text-center text-gray-600 mb-2">
            Add {remaining} more item{remaining !== 1 ? 's' : ''} to get $10 off!
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-[#8B7355] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end">
            <span className="text-sm text-gray-500">{totalItems}/3 Products</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          {cart.map((item) => (
            <div key={item.variantId} className="flex flex-col sm:flex-row py-6 border-b border-gray-200 last:border-b-0">
              <div className="relative w-full sm:w-[120px] h-[120px] mb-4 sm:mb-0">
                <Image
                  src={item.image.url || '/placeholder.png'}
                  alt={item.image.altText || item.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 sm:ml-6 flex flex-col">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <button 
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-gray-400 hover:text-[#FF6B6B]"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{item.variantTitle}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                    <button 
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button 
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="font-medium">
                    {formatPrice({
                      amount: (parseFloat(item.price.amount) * item.quantity).toString(),
                      currencyCode: item.price.currencyCode
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          
          {/* Discount Code Section */}
          <div className="mb-6">
            {hasValidDiscount ? (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md mb-4">
                <div>
                  <span className="font-medium text-green-600">Discount applied:</span>
                  <span className="ml-2 text-gray-700">{discountCode}</span>
                  {discountCode === 'BUY3SAVE10' && (
                    <p className="text-xs text-gray-500 mt-1">$10 discount automatically applied for 3+ products!</p>
                  )}
                </div>
                {discountCode !== 'BUY3SAVE10' && (
                  <button 
                    onClick={removeDiscountCode}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B7355]"
                    value={inputDiscountCode}
                    onChange={(e) => setInputDiscountCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyDiscount();
                      }
                    }}
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="bg-[#8B7355] text-white px-4 py-2 rounded-r-md text-sm hover:bg-[#7A6548]"
                  >
                    Apply
                  </button>
                </div>
                {discountError && (
                  <p className="text-red-500 text-xs mt-1 mb-2">{discountError}</p>
                )}
                {!discountError && (
                  <p className="text-gray-500 text-xs mt-1 mb-2">BUY3SAVE10 will automatically apply when you have 3+ products</p>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>{formatPrice({ amount: subtotal.toString(), currencyCode: 'USD' })}</span>
          </div>
          
          {hasValidDiscount && (
            <div className="flex justify-between mb-4 text-green-600">
              <span>Discount</span>
              <span>-{formatPrice({ amount: discountAmount.toString(), currencyCode: 'USD' })}</span>
            </div>
          )}
          
          <div className="flex justify-between mb-4">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
          <div className="flex justify-between mb-6 font-bold">
            <span>Total</span>
            <span>{formatPrice({ amount: finalTotal.toString(), currencyCode: 'USD' })}</span>
          </div>

          <a 
            href={checkoutUrl}
            onClick={handleCheckoutClick}
            className={`w-full bg-[#FF6B6B] text-white py-3 rounded-full hover:bg-[#ff5252] transition-colors font-medium inline-block text-center cursor-pointer ${isCheckoutLoading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isCheckoutLoading ? 'Preparing Checkout...' : 'Checkout'}
          </a>
          
          <p className="text-xs text-gray-500 text-center mt-2 mb-4">
            You'll be redirected to our secure checkout page
          </p>
          
          <Link 
            href="/"
            className="w-full mt-4 border border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 