"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import CartSlideOver from "@/components/CartSlideOver";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { prefetchCommonProductData } from '@/lib/shopify';

interface CartUIContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined);

export function useCartUI() {
  const context = useContext(CartUIContext);
  if (context === undefined) {
    throw new Error('useCartUI must be used within a CartUIProvider');
  }
  return context;
}

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Prefetch common product data when the template loads
  useEffect(() => {
    // Prefetch common product data in the background
    const prefetchData = async () => {
      await prefetchCommonProductData();
    };
    
    prefetchData();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartProvider>
      <CartUIContext.Provider value={{ isCartOpen, openCart, closeCart }}>
        <div className="flex flex-col min-h-screen overflow-hidden">
          <AnnouncementBanner />
          <Navbar onCartClick={openCart} />
          <AnimatePresence mode="wait">
            <PageTransition>
              {children}
            </PageTransition>
          </AnimatePresence>
          <Footer />
          <CartSlideOver isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
          <Toaster position="bottom-right" />
        </div>
      </CartUIContext.Provider>
    </CartProvider>
  );
} 