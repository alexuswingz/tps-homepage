"use client";

import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

interface CartSlideOverProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CartSlideOver({ isOpen, setIsOpen }: CartSlideOverProps) {
  const { cart, removeFromCart, updateQuantity, cartCount } = useCart();

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

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
    const total = calculateTotal();
    const freeShippingThreshold = 75;
    const remaining = Math.max(0, freeShippingThreshold - total);
    const progress = Math.min(100, (total / freeShippingThreshold) * 100);
    return { progress, remaining };
  };

  const { progress, remaining } = calculateProgress();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 z-[100]"
        onClose={setIsOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-500"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
              <div className="flex h-full flex-col overflow-y-auto bg-[#F9F6F1] shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <Dialog.Title className="text-2xl font-semibold text-gray-900">
                      Your Bag ({cartCount})
                    </Dialog.Title>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Free shipping progress */}
                  <div className="mt-8">
                    <p className="text-center text-sm text-gray-600 mb-2">
                      {remaining > 0 ? (
                        `You are ${formatPrice({ amount: remaining.toString(), currencyCode: 'USD' })} away from FREE SHIPPING!`
                      ) : (
                        'You\'ve earned FREE SHIPPING! 🎉'
                      )}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#8B7355] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#8B7355] flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-xs">Free Shipping</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-[#8B7355] flex items-center justify-center">
                          <span className="text-[#8B7355] text-xs">✓</span>
                        </div>
                        <span className="text-xs">Shot Glass Set</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {cart.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Your bag is empty</p>
                        </div>
                      ) : (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cart.map((item) => (
                            <li key={item.variantId} className="flex py-6">
                              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <Image
                                  src={item.image.url || '/placeholder.png'}
                                  alt={item.image.altText || `${item.title} product image`}
                                  fill
                                  className="object-cover object-center"
                                  sizes="96px"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.title}</h3>
                                    <p className="ml-4">
                                      {formatPrice({
                                        amount: (parseFloat(item.price.amount) * item.quantity).toString(),
                                        currencyCode: item.price.currencyCode,
                                      })}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">{item.variantTitle}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center border border-gray-200 rounded-full">
                                    <button
                                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                      className="p-2 hover:bg-gray-100 rounded-l-full"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                      className="p-2 hover:bg-gray-100 rounded-r-full"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.variantId)}
                                    className="text-gray-400 hover:text-gray-500"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                      <p>Subtotal</p>
                      <p>{formatPrice({ amount: calculateTotal().toString(), currencyCode: 'USD' })}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <p>Shipping</p>
                      <p>{remaining <= 0 ? 'FREE' : 'Calculated at checkout'}</p>
                    </div>
                    <button
                      className="w-full bg-[#FF6B6B] px-6 py-3 text-center text-base font-medium text-white shadow-sm hover:bg-[#ff5252] rounded-full"
                    >
                      Checkout ${calculateTotal().toFixed(2)}
                    </button>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <button
                        type="button"
                        className="font-medium text-[#8B7355] hover:text-[#7A6548]"
                        onClick={() => setIsOpen(false)}
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 