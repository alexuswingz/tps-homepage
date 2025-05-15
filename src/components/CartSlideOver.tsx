"use client";

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { createCheckoutUrl, getRecommendedAddons } from '@/lib/shopify';

interface CartSlideOverProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface AddonProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  featuredImage: {
    url: string;
    altText: string;
  };
  variant: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions?: {
      name: string;
      value: string;
    }[];
    quantityAvailable: number;
  };
  variants?: Array<{
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions?: {
      name: string;
      value: string;
    }[];
    quantityAvailable: number;
  }>;
}

export default function CartSlideOver({ isOpen, setIsOpen }: CartSlideOverProps) {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity,
    addToCart, 
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
  const [recommendedAddons, setRecommendedAddons] = useState<AddonProduct[]>([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

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

  // Fetch recommended add-ons
  useEffect(() => {
    const fetchAddons = async () => {
      if (isOpen) {
        setIsLoadingAddons(true);
        try {
          const addons = await getRecommendedAddons(4); // Fetch more recommendations
          setRecommendedAddons(addons);
          
          // Initialize selected options for each addon
          const initialOptions: Record<string, string> = {};
          addons.forEach((addon: AddonProduct) => {
            if (addon.variant?.selectedOptions && addon.variant.selectedOptions.length > 0) {
              initialOptions[addon.id] = addon.variant.title;
            }
          });
          setSelectedOptions(initialOptions);
        } catch (error) {
          console.error('Error fetching recommended add-ons:', error);
        } finally {
          setIsLoadingAddons(false);
        }
      }
    };

    fetchAddons();
  }, [isOpen]);

  // Generate checkout URL when cart changes or discount changes
  useEffect(() => {
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
  }, [cart, discountCode]);

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

  const calculateProgress = () => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const targetItemCount = 3;
    const remaining = Math.max(0, targetItemCount - totalItems);
    const progress = Math.min(100, (totalItems / targetItemCount) * 100);
    return { progress, remaining, totalItems };
  };

  const handleAddAddon = (addon: AddonProduct) => {
    // Check if the selected variant has quantityAvailable
    const selectedVariant = addon.variants?.find(v => v.title === selectedOptions[addon.id]) || addon.variant;
    
    // Don't add to cart if variant is out of stock
    if (!selectedVariant || selectedVariant.quantityAvailable <= 0) {
      // Could add toast notification here
      console.error('Cannot add out of stock item to cart');
      return;
    }
    
    addToCart({
      variantId: selectedVariant.id,
      productId: addon.id,
      title: addon.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: {
        url: addon.featuredImage.url,
        altText: addon.featuredImage.altText
      }
    });
  };

  const isItemInCart = (variantId: string) => {
    return cart.some(item => item.variantId === variantId);
  };

  const { progress, remaining, totalItems } = calculateProgress();
  const subtotal = calculateTotal();
  const finalTotal = calculateDiscountedTotal(subtotal);

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

                  <div className="mt-8">
                    <div className="flow-root">
                      {cart.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 mb-8">Your bag is empty</p>
                          <div className="h-px w-full bg-gray-200"></div>
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
                                  <div className="flex items-center border border-gray-200 rounded-md">
                                    <button
                                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                      className="p-2 hover:bg-gray-100 rounded-l-md"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                      className="p-2 hover:bg-gray-100 rounded-r-md"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.variantId)}
                                    className="ml-4 text-gray-400 hover:text-gray-500"
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
                  
                  {/* Essential Add-ons Section */}
                  <div className="mt-10">
                    <div className="border-t border-gray-200 pt-10">
                      <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">RECOMMENDED FOR YOU</h2>
                      <p className="text-center text-gray-600 text-sm mb-6">
                        {cart.length === 0 ? 'Products you might like' : 'Complete your order with these essential add-ons'}
                      </p>
                      
                      {cart.length > 0 && (
                        <div className="flex items-center justify-center gap-1 mb-4">
                          <div className="w-8 h-8 bg-[#8B7355] rounded-full flex items-center justify-center text-white text-xs">
                            {Math.min(totalItems, 3)}/3
                          </div>
                          <span className="text-xs text-gray-500">Products</span>
                        </div>
                      )}
                      
                      {isLoadingAddons ? (
                        <div className="flex justify-center py-6">
                          <div className="animate-pulse w-full max-w-sm">
                            <div className="flex space-x-4">
                              <div className="h-16 w-16 bg-gray-200 rounded"></div>
                              <div className="flex-1 py-1 space-y-3">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {recommendedAddons.map((addon) => (
                            <div key={addon.id} className="flex flex-col border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="relative h-32 w-full overflow-hidden rounded-md mb-3">
                                <Image
                                  src={addon.featuredImage.url}
                                  alt={addon.featuredImage.altText}
                                  fill
                                  className={`object-cover object-center ${
                                    (addon.variant.quantityAvailable <= 0) ? 'opacity-60 grayscale' : ''
                                  }`}
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                                {(addon.variant.quantityAvailable <= 0) && (
                                  <div className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    OUT OF STOCK
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{addon.title}</h3>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  {formatPrice(addon.variant.price)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2 h-8">{addon.description}</p>
                                <div className="mt-2 flex flex-col gap-2">
                                  {addon.variants && addon.variants.length > 1 ? (
                                    <select
                                      value={selectedOptions[addon.id] || ''}
                                      onChange={(e) => setSelectedOptions({...selectedOptions, [addon.id]: e.target.value})}
                                      className="w-full rounded-md border-gray-300 py-1.5 text-xs focus:border-[#8B7355] focus:outline-none focus:ring-[#8B7355]"
                                    >
                                      {addon.variants.map((variant) => (
                                        <option 
                                          key={variant.id} 
                                          value={variant.title}
                                          disabled={variant.quantityAvailable <= 0}
                                        >
                                          {variant.title}{variant.quantityAvailable <= 0 ? ' - Out of stock' : ''}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="text-xs text-gray-500">{addon.variant.title}</div>
                                  )}
                                  <button
                                    onClick={() => handleAddAddon(addon)}
                                    className={`w-full py-1.5 rounded-full text-xs font-medium ${
                                      isItemInCart(addon.variant.id) 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : addon.variant.quantityAvailable <= 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'
                                    }`}
                                    disabled={isItemInCart(addon.variant.id) || addon.variant.quantityAvailable <= 0}
                                  >
                                    {isItemInCart(addon.variant.id) 
                                      ? 'ADDED' 
                                      : addon.variant.quantityAvailable <= 0 
                                      ? 'OUT OF STOCK' 
                                      : 'ADD TO BAG'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    {/* Discount Code Section */}
                    <div className="mb-4">
                      {hasValidDiscount ? (
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
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
                          <div className="flex space-x-2">
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
                            <p className="text-red-500 text-xs mt-1">{discountError}</p>
                          )}
                          {!discountError && (
                            <p className="text-gray-500 text-xs mt-1">BUY3SAVE10 will automatically apply when you have 3+ products</p>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                      <p>Subtotal</p>
                      <p>{formatPrice({ amount: subtotal.toString(), currencyCode: 'USD' })}</p>
                    </div>
                    
                    {hasValidDiscount && (
                      <div className="flex justify-between text-base font-medium text-green-600 mb-2">
                        <p>Discount</p>
                        <p>-{formatPrice({ amount: discountAmount.toString(), currencyCode: 'USD' })}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <p>Shipping</p>
                      <p>{remaining <= 0 ? 'FREE' : 'Calculated at checkout'}</p>
                    </div>
                    
                    <div className="h-px bg-gray-200 my-3"></div>
                    
                    <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                      <p>Total</p>
                      <p>{formatPrice({ amount: finalTotal.toString(), currencyCode: 'USD' })}</p>
                    </div>
                    
                    <a
                      href={checkoutUrl}
                      onClick={handleCheckoutClick}
                      className={`w-full bg-[#FF6B6B] px-6 py-3 text-center text-base font-medium text-white shadow-sm hover:bg-[#ff5252] rounded-full block ${isCheckoutLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {isCheckoutLoading ? 'Preparing Checkout...' : 'CHECKOUT'}
                    </a>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Shipping and Taxes Calculated at checkout
                    </p>
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