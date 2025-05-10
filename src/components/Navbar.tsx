"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

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
                          <div className="w-10 h-10 bg-[#F4D03F] rounded-lg flex-shrink-0"></div>
                          <span className="font-medium">HOUSEPLANTS</span>
                        </Link>
                        <Link href="/shop?category=garden-plants" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          <div className="w-10 h-10 bg-[#52BE80] rounded-lg flex-shrink-0"></div>
                          <span className="font-medium">GARDEN PLANTS</span>
                        </Link>
                        <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          <div className="w-10 h-10 bg-[#5DADE2] rounded-lg flex-shrink-0"></div>
                          <span className="font-medium">HYDRO & AQUATIC</span>
                        </Link>
                        <Link href="/shop?category=plant-supplements" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900" onClick={handleLinkClick}>
                          <div className="w-10 h-10 bg-[#D7BDE2] rounded-lg flex-shrink-0"></div>
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
                        <div className="bg-[#F4D03F] aspect-square rounded-xl flex items-center justify-center p-4 transition-transform transform group-hover:scale-105">
                          <span className="text-center font-medium text-gray-800">BUILD A BUNDLE</span>
                        </div>
                      </Link>
                      <Link href="/nutrients" className="block group" onClick={handleLinkClick}>
                        <div className="bg-[#ABEBC6] aspect-square rounded-xl flex items-center justify-center p-4 transition-transform transform group-hover:scale-105">
                          <span className="text-center font-medium text-gray-800">FIND NUTRIENTS</span>
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

        {/* Right section - desktop */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link href="/nutrients" className="uppercase font-medium text-gray-800 hover:text-gray-600">
            Find Your Nutrients
          </Link>
          <div className="flex items-center space-x-4">
            <button className="text-gray-800 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="text-gray-800 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={onCartClick}
              className="text-gray-800 hover:text-gray-600 relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile icons - always visible */}
        <div className="flex lg:hidden items-center space-x-4">
          <button 
            onClick={onCartClick}
            className="text-gray-800 hover:text-gray-600 relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-[#FDF6EF] z-40 flex flex-col pt-24 px-6 overflow-y-auto">
            {/* Search bar */}
            <div className="relative mb-8">
              <div className="flex items-center border-b border-gray-300 pb-2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="SEARCH" 
                  className="w-full pl-3 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Categories */}
            <Link href="/build-bundle" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
              <div className="w-12 h-12 bg-[#B5A186] rounded-lg flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">BUILD A BUNDLE & SAVE $10</span>
            </Link>

            <Link href="/shop?category=houseplants" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
              <div className="w-12 h-12 bg-[#F4D03F] rounded-lg flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">HOUSEPLANTS</span>
            </Link>

            <Link href="/shop?category=garden-plants" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
              <div className="w-12 h-12 bg-[#52BE80] rounded-lg flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">GARDEN PLANTS</span>
            </Link>

            <Link href="/shop?category=hydro-aquatic" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
              <div className="w-12 h-12 bg-[#5DADE2] rounded-lg flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">HYDRO & AQUATIC</span>
            </Link>

            <Link href="/shop?category=plant-supplements" className="flex items-center space-x-4 py-4 border-b border-gray-200" onClick={handleLinkClick}>
              <div className="w-12 h-12 bg-[#D7BDE2] rounded-lg flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">PLANT SUPPLEMENTS</span>
            </Link>

            <Link href="/shop" className="w-full mt-6 mb-8" onClick={handleLinkClick}>
              <button className="w-full py-4 bg-[#FF6B6B] text-white rounded-full font-medium">
                SHOP ALL
              </button>
            </Link>

            {/* Additional Links */}
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
        )}
      </div>
    </nav>
  );
};

export default Navbar; 