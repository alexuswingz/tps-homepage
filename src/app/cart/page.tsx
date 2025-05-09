"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartCount } = useCart();

  useEffect(() => {
    // Log cart contents on mount
    console.log('Cart Page - Current cart:', cart);
    console.log('Cart Page - Cart count:', cartCount);
    
    // Check localStorage directly
    if (typeof window !== 'undefined') {
      const rawData = localStorage.getItem('tps_cart_v1');
      console.log('Cart Page - localStorage data:', rawData);
    }
  }, [cart, cartCount]);

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

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">Your Cart ({cartCount} items)</h1>
      
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
          
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>{formatPrice({ amount: calculateTotal().toString(), currencyCode: 'USD' })}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
          <div className="flex justify-between mb-6 font-bold">
            <span>Total</span>
            <span>{formatPrice({ amount: calculateTotal().toString(), currencyCode: 'USD' })}</span>
          </div>

          <button 
            className="w-full bg-[#FF6B6B] text-white py-3 rounded-full hover:bg-[#ff5252] transition-colors font-medium"
          >
            Checkout
          </button>
          
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