"use client";

import { useState, createContext, useContext } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import CartSlideOver from "@/components/CartSlideOver";
import Footer from "@/components/Footer";

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

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartProvider>
      <CartUIContext.Provider value={{ isCartOpen, openCart, closeCart }}>
        <AnnouncementBanner />
        <Navbar onCartClick={openCart} />
        {children}
        <Footer />
        <CartSlideOver isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
        <Toaster position="bottom-right" />
      </CartUIContext.Provider>
    </CartProvider>
  );
} 