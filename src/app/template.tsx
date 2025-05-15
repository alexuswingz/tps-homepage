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
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Handle routing for S3 static hosting
  useEffect(() => {
    // Check for hash routing (e.g. /#/nutrients)
    if (typeof window !== 'undefined') {
      // Get the initial hash
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#/')) {
          const route = hash.substring(2); // Remove the '#/' prefix
          if (['nutrients', 'shop', 'cart', 'build-a-bundle', 'search'].includes(route)) {
            console.log(`Hash navigation to: ${route}`);
            // Use router to navigate to the actual route
            router.push(`/${route}`);
          } else if (route.startsWith('product/')) {
            console.log(`Hash navigation to product: ${route}`);
            router.push(`/${route}`);
          }
        }
      };

      // Listen for hash changes
      window.addEventListener('hashchange', handleHashChange);
      
      // Check hash on initial load
      handleHashChange();
      
      // Check for redirectPath in sessionStorage
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath) {
        console.log(`Restoring from session: ${redirectPath}`);
        // Clear it immediately to prevent loops
        sessionStorage.removeItem('redirectPath');
        // Navigate to the stored path
        router.push(redirectPath);
      }

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, [router]);

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