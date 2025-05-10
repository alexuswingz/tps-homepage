"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, FormEvent, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import SearchSuggestions from './SearchSuggestions';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { cartCount } = useCart();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  // Get category image based on title
  const getCategoryImage = (category: string) => {
    switch (category.toLowerCase()) {
      case 'houseplants':
        return '/assets/categories/houseplants.jpg';
      case 'garden plants':
        return '/assets/categories/garden.jpg';
      case 'hydro & aquatic':
        return '/assets/categories/hydro.jpg';
      case 'supplements':
        return '/assets/categories/supplements.jpg';
      default:
        return '/assets/categories/default.jpg';
    }
  };

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

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value); // Debug log
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
        console.log('Fetching search results for:', value); // Debug log
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        console.log('Search results:', data.products); // Debug log
        setSearchResults(data.products);
        setShowSuggestions(true); // Explicitly set to show suggestions
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
                          <div className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image src={getCategoryImage('houseplants')} alt="Houseplants" fill className="object-cover" />
                          </div>
                          <span className="font-medium">HOUSEPLANTS</span>
                        </Link>
                        <Link href="/shop?category=garden-plants" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          <div className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image src={getCategoryImage('garden plants')} alt="Garden Plants" fill className="object-cover" />
                          </div>
                          <span className="font-medium">GARDEN PLANTS</span>
                        </Link>
                        <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          <div className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image src={getCategoryImage('hydro & aquatic')} alt="Hydro & Aquatic" fill className="object-cover" />
                          </div>
                          <span className="font-medium">HYDRO & AQUATIC</span>
                        </Link>
                        <Link href="/shop?category=plant-supplements" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          <div className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image src={getCategoryImage('supplements')} alt="Plant Supplements" fill className="object-cover" />
                          </div>
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

                    {/* Third grid - Featured Links with Images */}
                    <div className="grid grid-cols-2 gap-6">
                      <Link href="/build-bundle" className="block group" onClick={handleLinkClick}>
                        <div className="relative aspect-square rounded-xl overflow-hidden">
                          <Image
                            src="/assets/categories/bundle.jpg"
                            alt="Build a Bundle"
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-center font-medium text-white text-lg">BUILD A BUNDLE</span>
                          </div>
                        </div>
                      </Link>
                      <Link href="/nutrients" className="block group" onClick={handleLinkClick}>
                        <div className="relative aspect-square rounded-xl overflow-hidden">
                          <Image
                            src="/assets/categories/nutrients.jpg"
                            alt="Find Nutrients"
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-center font-medium text-white text-lg">FIND NUTRIENTS</span>
                          </div>
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
                  onFocus={() => {
                    console.log('Search input focused'); // Debug log
                    setShowSuggestions(true);
                  }}
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
                  console.log('Closing suggestions'); // Debug log
                  setShowSuggestions(false);
                }}
                searchQuery={searchQuery}
              />
            </div>
          </div>

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
          <div className="fixed inset-0 bg-[#FDF6EF] z-40 lg:hidden">
            <div className="p-6">
              {/* Rest of mobile menu items */}
              <div className="space-y-6">
                <Link href="/build-bundle" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  <div className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                    <Image src="/assets/categories/bundle.jpg" alt="Build a Bundle" fill className="object-cover" />
                  </div>
                  <span className="text-gray-800 font-medium">BUILD A BUNDLE & SAVE $10</span>
                </Link>

                <Link href="/shop?category=houseplants" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  <div className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                    <Image src={getCategoryImage('houseplants')} alt="Houseplants" fill className="object-cover" />
                  </div>
                  <span className="text-gray-800 font-medium">HOUSEPLANTS</span>
                </Link>

                <Link href="/shop?category=garden-plants" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  <div className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                    <Image src={getCategoryImage('garden plants')} alt="Garden Plants" fill className="object-cover" />
                  </div>
                  <span className="text-gray-800 font-medium">GARDEN PLANTS</span>
                </Link>

                <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  <div className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                    <Image src={getCategoryImage('hydro & aquatic')} alt="Hydro & Aquatic" fill className="object-cover" />
                  </div>
                  <span className="text-gray-800 font-medium">HYDRO & AQUATIC</span>
                </Link>

                <Link href="/shop?category=plant-supplements" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
                  <div className="relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                    <Image src={getCategoryImage('supplements')} alt="Plant Supplements" fill className="object-cover" />
                  </div>
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