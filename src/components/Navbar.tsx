"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, FormEvent, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import SearchSuggestions from './SearchSuggestions';
import type { Product } from '@/types/shopify';
import { searchProducts } from '@/lib/shopify';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { cartCount } = useCart();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Get category icon based on title
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'houseplants':
        return (
          <div className="w-12 h-12 p-2 bg-green-100 rounded-lg text-black transform transition-transform hover:scale-110">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              <path d="M12 6.5a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
              <path d="M12 6.5c2 0 4 1.5 5 3.5-1-2-1-3.5-1-4.5 0 1-1 2.5-4 2.5" fill="currentColor" opacity="0.2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15c3 0 5-2 5-5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13.5c-2-1.5-3-4-2-6.5" />
            </svg>
          </div>
        );
      case 'lawn and garden':
        return (
          <div className="w-12 h-12 p-2 bg-amber-100 rounded-lg text-black transform transition-transform hover:scale-110">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              <path d="M12 12a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
        );
      case 'hydro & aquatic':
        return (
          <div className="w-12 h-12 p-2 bg-blue-100 rounded-lg text-black transform transition-transform hover:scale-110">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008.828 10.172V5L8 4z" />
              <path d="M10 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
              <path d="M14 16a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
        );
      case 'supplements':
        return (
          <div className="w-12 h-12 p-2 bg-purple-100 rounded-lg text-black transform transition-transform hover:scale-110">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              <path d="M9 16a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
              <path d="M15 16a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 p-2 bg-gray-100 rounded-lg text-black transform transition-transform hover:scale-110">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              <path d="M6 10a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
              <path d="M12 16a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.3" />
              <path d="M18 10a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
        );
    }
  };

  // Bundle icon
  const getBundleIcon = () => (
    <div className="w-12 h-12 p-2 bg-red-100 rounded-lg text-black transform transition-transform hover:scale-110">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        <path d="M12 11l8-4v10l-8 4V11z" fill="currentColor" opacity="0.2" />
        <path d="M12 11l-8-4v10l8 4V11z" fill="currentColor" opacity="0.1" />
      </svg>
    </div>
  );

  // Nutrients icon
  const getNutrientsIcon = () => (
    <div className="w-12 h-12 p-2 bg-teal-100 rounded-lg text-black transform transition-transform hover:scale-110">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        <path d="M9 9a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
        <path d="M9 19a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  );

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setIsShopOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setIsShopOpen(false);
    }, 300); // 300ms delay before closing
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsShopOpen(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleMobileSearch = (e: FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce the search
    if (value.length >= 2) {
      setIsSearching(true);
      try {
        // Use client-side search instead of API route
        const products = await searchProducts(value);
        setSearchResults(products);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  return (
    <nav className="bg-[#FDF6EF] w-full z-50">
      <div className="max-w-[1400px] mx-auto py-4 px-6 flex items-center justify-between relative">
        {/* Mobile menu button */}
        <button 
          className={`lg:hidden text-black z-50 ${isMobileMenuOpen ? 'fixed top-4 left-6' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Left section - desktop */}
        <div className="hidden lg:flex items-center space-x-8">
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className="flex items-center space-x-1 text-black hover:text-gray-600 group"
            >
              <span className="uppercase font-medium">Shop</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown menu */}
            {isShopOpen && (
              <div 
                className="fixed left-0 right-0 bg-[#FDF6EF] shadow-lg"
                style={{ top: '88px', zIndex: 40 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="max-w-[1400px] mx-auto px-6 py-12">
                  <div className="grid grid-cols-3 gap-12">
                    {/* First grid - Categories */}
                    <div>
                      <div className="space-y-6">
                        <Link href="/shop?category=houseplants" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          {getCategoryIcon('houseplants')}
                          <span className="font-medium">HOUSEPLANTS</span>
                        </Link>
                        <Link href="/shop?category=garden-plants" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          {getCategoryIcon('lawn and garden')}
                          <span className="font-medium">LAWN AND GARDEN</span>
                        </Link>
                        <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          {getCategoryIcon('hydro & aquatic')}
                          <span className="font-medium">HYDRO & AQUATIC</span>
                        </Link>
                        <Link href="/shop?category=plant-supplements" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          {getCategoryIcon('supplements')}
                          <span className="font-medium">SPECIALTY SUPPLEMENTS</span>
                        </Link>
                        <Link 
                          href="/shop" 
                          className="inline-block mt-6 px-8 py-3 bg-[#FF6B6B] text-white rounded-full hover:bg-opacity-90 font-medium"
                          onClick={handleLinkClick}
                        >
                          SHOP ALL
                        </Link>
                      </div>
                    </div>

                    {/* Second grid - Additional Links */}
                    <div>
                      <div className="space-y-4">
                        <Link href="/build-a-bundle" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={handleLinkClick}>
                          BUILD A BUNDLE & SAVE $10
                        </Link>
                        <Link href="/ask" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={handleLinkClick}>
                          ASK A QUESTION
                        </Link>
                        <Link href="/blog" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={handleLinkClick}>
                          BLOG: THE POUR SPOUT
                        </Link>
                        <Link href="/account" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={handleLinkClick}>
                          MY ACCOUNT
                        </Link>
                      </div>
                    </div>

                    {/* Third grid - Featured Links with Icons */}
                    <div className="grid grid-cols-2 gap-6">
                      <Link href="/build-a-bundle" className="block" onClick={handleLinkClick}>
                        <div className="bg-red-50 rounded-xl p-6 h-full flex flex-col items-center justify-center hover:bg-red-100 transition-colors">
                          <div className="mb-3">
                            {getBundleIcon()}
                          </div>
                          <span className="text-center font-medium text-gray-800 text-lg">BUILD A BUNDLE</span>
                        </div>
                      </Link>
                      <Link href="/nutrients" className="block" onClick={handleLinkClick}>
                        <div className="bg-teal-50 rounded-xl p-6 h-full flex flex-col items-center justify-center hover:bg-teal-100 transition-colors">
                          <div className="mb-3">
                            {getNutrientsIcon()}
                          </div>
                          <span className="text-center font-medium text-gray-800 text-lg">FIND NUTRIENTS</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link href="/build-a-bundle" className="uppercase font-medium text-black hover:text-gray-600" onClick={handleLinkClick}>
            Build a Bundle
          </Link>
          <Link href="/nutrients" className="uppercase font-medium text-black hover:text-gray-600">
            Find Your Nutrients
          </Link>
        </div>

        {/* Center - Logo */}
        <div className="mx-auto lg:mx-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          <Link href="/">
            <Image
              src="/assets/logo/TPS_Plant Food_Black_Horiz_Label_Logo.png"
              alt="TPS Plant Foods"
              width={200}
              height={60}
              className="h-auto w-[150px] lg:w-[200px]"
              priority
            />
          </Link>
        </div>

        {/* Right section - Search, Account and Cart */}
        <div className="flex items-center space-x-4">
          {/* Desktop Search */}
          <div className="hidden lg:block relative">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-[300px]">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-[#FF6B6B] text-sm transition-all focus:shadow-md"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black hover:text-[#FF6B6B] transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.1" />
                  </svg>
                </button>
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF6B6B]"></div>
                  </div>
                )}
              </div>
            </form>
            {/* Search Suggestions */}
            <div className="absolute w-full">
              <SearchSuggestions
                products={searchResults}
                isVisible={showSuggestions && searchQuery.length >= 2}
                onClose={() => {
                  setShowSuggestions(false);
                }}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          {/* Mobile Search Button */}
          <button 
            className="lg:hidden text-black hover:text-gray-600"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Account Icon */}
          <Link href="/account" className="text-black hover:text-gray-600 transform transition-transform hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <circle cx="12" cy="7" r="2" fill="currentColor" opacity="0.2" />
            </svg>
          </Link>

          {/* Cart button */}
          <button
            onClick={onCartClick}
            className="relative text-black hover:text-gray-600 transform transition-transform hover:scale-110"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              <path d="M9 11V7a3 3 0 016 0v4" fill="currentColor" opacity="0.2" />
              <path d="M5 9h14l1 12H4L5 9z" fill="currentColor" opacity="0.1" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-[#FDF6EF] z-40 lg:hidden overflow-y-auto">
            <div className="p-6 pt-16 pb-24">
              {/* Mobile search */}
              <div className="mb-6">
                <form onSubmit={handleMobileSearch} className="flex items-center">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-[#FF6B6B]"
                    />
                    <button
                      type="submit"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              {/* Menu items */}
              <div className="space-y-6">
                <Link href="/build-a-bundle" className="flex items-center space-x-4 py-4 border-b border-gray-200 transition-all duration-300 hover:pl-2 hover:border-red-300" onClick={handleLinkClick}>
                  {getBundleIcon()}
                  <span className="text-gray-800 font-medium">BUILD A BUNDLE & SAVE $10</span>
                </Link>

                <Link href="/nutrients" className="flex items-center space-x-4 py-4 border-b border-gray-200 transition-all duration-300 hover:pl-2 hover:border-teal-300" onClick={handleLinkClick}>
                  {getNutrientsIcon()}
                  <span className="text-gray-800 font-medium">FIND YOUR NUTRIENTS</span>
                </Link>

                <Link href="/shop?category=houseplants" className="flex items-center space-x-4 py-4 border-b border-gray-200 transition-all duration-300 hover:pl-2 hover:border-green-300" onClick={handleLinkClick}>
                  {getCategoryIcon('houseplants')}
                  <span className="text-gray-800 font-medium">HOUSEPLANTS</span>
                </Link>

                <Link href="/shop?category=garden-plants" className="flex items-center space-x-4 py-4 border-b border-gray-200 transition-all duration-300 hover:pl-2 hover:border-amber-300" onClick={handleLinkClick}>
                  {getCategoryIcon('lawn and garden')}
                  <span className="text-gray-800 font-medium">LAWN AND GARDEN</span>
                </Link>

                <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-4 py-4 border-b border-gray-200 transition-all duration-300 hover:pl-2 hover:border-blue-300" onClick={handleLinkClick}>
                  {getCategoryIcon('hydro & aquatic')}
                  <span className="text-gray-800 font-medium">HYDRO & AQUATIC</span>
                </Link>

                <Link href="/shop?category=plant-supplements" className="flex items-center space-x-4 py-4 border-b border-gray-200 transition-all duration-300 hover:pl-2 hover:border-purple-300" onClick={handleLinkClick}>
                  {getCategoryIcon('supplements')}
                  <span className="text-gray-800 font-medium">SPECIALTY SUPPLEMENTS</span>
                </Link>

                <Link href="/shop" className="w-full mt-6 mb-8" onClick={handleLinkClick}>
                  <button className="w-full py-4 bg-[#FF6B6B] text-white rounded-full font-medium hover:bg-[#FF5252] transform transition-transform hover:scale-105 shadow-md hover:shadow-lg">
                    SHOP ALL
                  </button>
                </Link>

                <Link href="/ask" className="flex items-center space-x-3 py-3 text-black hover:text-[#FF6B6B] transition-colors duration-300 transform hover:translate-x-1" onClick={handleLinkClick}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                    <path d="M12 12a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity="0.2" />
                  </svg>
                  <span className="font-medium">Ask a Question</span>
                </Link>

                <Link href="/account" className="flex items-center space-x-3 py-3 text-black hover:text-[#FF6B6B] transition-colors duration-300 transform hover:translate-x-1" onClick={handleLinkClick}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">My Account</span>
                </Link>

                <Link href="/blog" className="flex items-center space-x-3 py-3 text-black hover:text-[#FF6B6B] transition-colors duration-300 transform hover:translate-x-1" onClick={handleLinkClick}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                    <path d="M7 8h6M7 12h4" strokeLinecap="round" strokeWidth={1.5} />
                    <path d="M13 16h4m0-4h2" strokeLinecap="round" strokeWidth={1.5} />
                  </svg>
                  <span className="font-medium">Blog: The Pour Spout</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 