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
          <svg className="w-10 h-10 p-2 bg-green-100 rounded-lg text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11.5a.5.5 0 111 0 .5.5 0 01-1 0zm7.5 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0zM12 2a3 3 0 013 3c0 1.6-1.4 2.5-3 2.5S9 6.6 9 5c0-1.65 1.35-3 3-3z" />
          </svg>
        );
      case 'garden plants':
        return (
          <svg className="w-10 h-10 p-2 bg-amber-100 rounded-lg text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-2.2 0-4 1.8-4 4 0 4 4 8 4 8s4-4 4-8c0-2.2-1.8-4-4-4zm-3.75-2.5c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44M15.75 5.5c0 1.38-1.12 2.5-2.5 2.5-.53 0-1.01-.16-1.42-.44" />
          </svg>
        );
      case 'hydro & aquatic':
        return (
          <svg className="w-10 h-10 p-2 bg-blue-100 rounded-lg text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 13h8m-2-2l2 2-2 2M3 13h8M5 15l-2-2 2-2M12 3v18" />
          </svg>
        );
      case 'supplements':
        return (
          <svg className="w-10 h-10 p-2 bg-purple-100 rounded-lg text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m-6-8h6M5 8h2v12H5V8zm12 0h2v12h-2V8zm-8-3h6v14H9V5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-10 p-2 bg-gray-100 rounded-lg text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        );
    }
  };

  // Bundle icon
  const getBundleIcon = () => (
    <svg className="w-10 h-10 p-2 bg-red-100 rounded-lg text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  // Nutrients icon
  const getNutrientsIcon = () => (
    <svg className="w-10 h-10 p-2 bg-teal-100 rounded-lg text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008.828 10.172V5L8 4z" />
    </svg>
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
          className={`lg:hidden text-gray-800 z-50 ${isMobileMenuOpen ? 'fixed top-4 left-6' : ''}`}
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
              className="flex items-center space-x-1 text-gray-800 hover:text-gray-600"
            >
              <span className="uppercase font-medium">Shop</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          {getCategoryIcon('garden plants')}
                          <span className="font-medium">GARDEN PLANTS</span>
                        </Link>
                        <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          {getCategoryIcon('hydro & aquatic')}
                          <span className="font-medium">HYDRO & AQUATIC</span>
                        </Link>
                        <Link href="/shop?category=plant-supplements" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          {getCategoryIcon('supplements')}
                          <span className="font-medium">PLANT SUPPLEMENTS</span>
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
                        <Link href="/build-bundle" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={handleLinkClick}>
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
                      <Link href="/build-bundle" className="block" onClick={handleLinkClick}>
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
          <Link href="/build-bundle" className="uppercase font-medium text-gray-800 hover:text-gray-600" onClick={handleLinkClick}>
            Build a Bundle
          </Link>
          <Link href="/nutrients" className="uppercase font-medium text-gray-800 hover:text-gray-600">
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
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-[#FF6B6B] text-sm"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            className="lg:hidden text-gray-800 hover:text-gray-600"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Account Icon */}
          <Link href="/account" className="text-gray-800 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          {/* Cart button */}
          <button
            onClick={onCartClick}
            className="relative text-gray-800 hover:text-gray-600"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                <Link href="/build-bundle" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  {getBundleIcon()}
                  <span className="text-gray-800 font-medium">BUILD A BUNDLE & SAVE $10</span>
                </Link>

                <Link href="/nutrients" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  {getNutrientsIcon()}
                  <span className="text-gray-800 font-medium">FIND YOUR NUTRIENTS</span>
                </Link>

                <Link href="/shop?category=houseplants" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  {getCategoryIcon('houseplants')}
                  <span className="text-gray-800 font-medium">HOUSEPLANTS</span>
                </Link>

                <Link href="/shop?category=garden-plants" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  {getCategoryIcon('garden plants')}
                  <span className="text-gray-800 font-medium">GARDEN PLANTS</span>
                </Link>

                <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  {getCategoryIcon('hydro & aquatic')}
                  <span className="text-gray-800 font-medium">HYDRO & AQUATIC</span>
                </Link>

                <Link href="/shop?category=plant-supplements" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  {getCategoryIcon('supplements')}
                  <span className="text-gray-800 font-medium">PLANT SUPPLEMENTS</span>
                </Link>

                <Link href="/shop" className="w-full mt-6 mb-8" onClick={handleLinkClick}>
                  <button className="w-full py-4 bg-[#FF6B6B] text-white rounded-full font-medium">
                    SHOP ALL
                  </button>
                </Link>

                <Link href="/ask" className="flex items-center space-x-3 py-3 text-gray-700" onClick={handleLinkClick}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Ask a Question</span>
                </Link>

                <Link href="/account" className="flex items-center space-x-3 py-3 text-gray-700" onClick={handleLinkClick}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">My Account</span>
                </Link>

                <Link href="/blog" className="flex items-center space-x-3 py-3 text-gray-700" onClick={handleLinkClick}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
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