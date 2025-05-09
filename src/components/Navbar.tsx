"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="bg-[#FDF6EF] w-full z-50">
      <div className="max-w-[1400px] mx-auto py-4 px-6 flex items-center justify-between relative">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-gray-800 z-50"
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
          <div className="relative">
            <button 
              className="flex items-center space-x-1 text-gray-800 hover:text-gray-600"
              onMouseEnter={() => setIsShopOpen(true)}
              onMouseLeave={() => setIsShopOpen(false)}
            >
              <span className="uppercase font-medium">Shop</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown menu */}
            {isShopOpen && (
              <div className="absolute top-full left-0 bg-white shadow-lg py-2 px-4 min-w-[200px]">
                {/* Add dropdown items here */}
              </div>
            )}
          </div>
          <Link href="/build-bundle" className="uppercase font-medium text-gray-800 hover:text-gray-600">
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
          <div className="fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6">
            <Link href="/shop" className="py-4 border-b border-gray-100 uppercase font-medium">
              Shop
            </Link>
            <Link href="/build-bundle" className="py-4 border-b border-gray-100 uppercase font-medium">
              Build a Bundle
            </Link>
            <Link href="/nutrients" className="py-4 border-b border-gray-100 uppercase font-medium">
              Find Your Nutrients
            </Link>
            <div className="flex items-center space-x-6 py-4">
              <button className="text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 