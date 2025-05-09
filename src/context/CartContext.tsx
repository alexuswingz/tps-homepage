import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: {
    url: string;
    altText: string;
  };
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a unique storage key with a version number to avoid conflicts
const CART_STORAGE_KEY = 'tps_cart_v1';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        console.log('Loading cart from localStorage:', savedCart);
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          console.log('Cart loaded:', parsedCart);
        }
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Update localStorage and cartCount whenever cart changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      console.log('Saving cart to localStorage:', cart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      const newCount = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(newCount);
      console.log('Updated cart count:', newCount);
    }
  }, [cart, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    console.log('addToCart called with:', item);
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.variantId === item.variantId);
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        console.log('Updated existing item in cart:', newCart);
        return newCart;
      } else {
        // Item doesn't exist, add new item
        const newCart = [...prevCart, { ...item, quantity: 1 }];
        console.log('Added new item to cart:', newCart);
        return newCart;
      }
    });
  };

  const removeFromCart = (variantId: string) => {
    console.log('Removing item from cart:', variantId);
    setCart(prevCart => prevCart.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    console.log('Updating quantity for item:', variantId, 'to', quantity);
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.variantId !== variantId);
      }
      
      return prevCart.map(item => 
        item.variantId === variantId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
  };

  // Log the current cart state for debugging
  console.log('Current cart state:', { cart, cartCount, isInitialized });

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 