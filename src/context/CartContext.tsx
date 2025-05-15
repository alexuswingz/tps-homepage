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

interface DiscountResult {
  success: boolean;
  errorMessage?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  applyDiscountCode: (code: string) => DiscountResult;
  removeDiscountCode: () => void;
  hasValidDiscount: boolean;
  calculateDiscountedTotal: (subtotal: number) => number;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a unique storage key with a version number to avoid conflicts
const CART_STORAGE_KEY = 'tps_cart_v1';
const DISCOUNT_STORAGE_KEY = 'tps_discount_v1';

// Available discount codes
const DISCOUNT_CODES = {
  BUY3SAVE10: { type: 'fixed', amount: 10 }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [hasValidDiscount, setHasValidDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load cart and discount from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        console.log('Loading cart from localStorage:', savedCart);
        
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            // Validate cart data structure before setting state
            if (Array.isArray(parsedCart)) {
              setCart(parsedCart);
              console.log('Cart loaded:', parsedCart);
            } else {
              console.warn('Invalid cart format in localStorage, using empty cart');
              setCart([]);
            }
          } catch (parseError) {
            console.error('Failed to parse cart JSON:', parseError);
            // Clear corrupted data
            localStorage.removeItem(CART_STORAGE_KEY);
            setCart([]);
          }
        }
        
        const savedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
        if (savedDiscount) {
          try {
            const discountData = JSON.parse(savedDiscount);
            if (discountData && typeof discountData === 'object') {
              const { code, valid, amount } = discountData;
              setDiscountCode(code || '');
              setHasValidDiscount(!!valid);
              setDiscountAmount(Number(amount) || 0);
            }
          } catch (discountError) {
            console.error('Failed to parse discount data:', discountError);
            localStorage.removeItem(DISCOUNT_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to access localStorage:', e);
        // For permissions issues or other localStorage problems
        setCart([]);
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Update localStorage and cartCount whenever cart changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        console.log('Saving cart to localStorage:', cart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        const newCount = cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(newCount);
        console.log('Updated cart count:', newCount);
        
        // Auto-apply BUY3SAVE10 discount when cart has 3 or more items
        if (newCount >= 3 && !hasValidDiscount) {
          // Apply the discount code
          const normalizedCode = 'BUY3SAVE10';
          setDiscountCode(normalizedCode);
          setHasValidDiscount(true);
          setDiscountAmount(DISCOUNT_CODES[normalizedCode as keyof typeof DISCOUNT_CODES].amount);
        } else if (newCount < 3 && discountCode === 'BUY3SAVE10') {
          // Remove the discount if items are removed and total is less than 3
          setDiscountCode('');
          setHasValidDiscount(false);
          setDiscountAmount(0);
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        // Continue execution even if localStorage fails
      }
    }
  }, [cart, isInitialized, hasValidDiscount, discountCode]);

  // Save discount state to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify({
          code: discountCode,
          valid: hasValidDiscount,
          amount: discountAmount
        }));
      } catch (error) {
        console.error('Error saving discount to localStorage:', error);
        // Continue execution even if localStorage fails
      }
    }
  }, [discountCode, hasValidDiscount, discountAmount, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    console.log('addToCart called with:', item);
    
    const quantityToAdd = item.quantity || 1; // Default to 1 if quantity is not specified
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.variantId === item.variantId);
      
      if (existingItemIndex >= 0) {
        // Item exists, add the quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantityToAdd;
        console.log('Updated existing item in cart:', newCart);
        return newCart;
      } else {
        // Item doesn't exist, add new item with specified quantity
        const newItem = { 
          variantId: item.variantId,
          productId: item.productId,
          title: item.title,
          variantTitle: item.variantTitle,
          price: item.price,
          image: item.image,
          quantity: quantityToAdd 
        };
        
        const newCart = [...prevCart, newItem];
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

  // Apply a discount code and return whether it was valid
  const applyDiscountCode = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    setDiscountCode(normalizedCode);
    
    // Special handling for BUY3SAVE10
    if (normalizedCode === 'BUY3SAVE10') {
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      if (totalItems < 3) {
        // Not enough items in cart for this discount
        setHasValidDiscount(false);
        setDiscountAmount(0);
        return { success: false, errorMessage: 'You need 3 or more products to use this discount code.' };
      }
    }
    
    // Check if the code is valid
    if (normalizedCode in DISCOUNT_CODES) {
      const discount = DISCOUNT_CODES[normalizedCode as keyof typeof DISCOUNT_CODES];
      setHasValidDiscount(true);
      setDiscountAmount(discount.amount);
      return { success: true };
    } else {
      setHasValidDiscount(false);
      setDiscountAmount(0);
      return { success: false, errorMessage: 'Invalid discount code.' };
    }
  };

  // Remove any applied discount code
  const removeDiscountCode = () => {
    setDiscountCode('');
    setHasValidDiscount(false);
    setDiscountAmount(0);
  };

  // Calculate the total after applying the discount
  const calculateDiscountedTotal = (subtotal: number) => {
    if (!hasValidDiscount) return subtotal;
    
    // Check if the discount should be applied based on the cart contents
    if (discountCode === "BUY3SAVE10") {
      // Count total number of items
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      // If total items is 3 or more, apply the discount
      if (totalItems >= 3) {
        return Math.max(0, subtotal - discountAmount);
      } else {
        // Not enough items for this discount code
        return subtotal;
      }
    }
    
    // For other discount codes, simply apply the discount amount
    return Math.max(0, subtotal - discountAmount);
  };

  // Log the current cart state for debugging
  console.log('Current cart state:', { cart, cartCount, isInitialized, discountCode, hasValidDiscount });

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount,
      discountCode,
      setDiscountCode,
      applyDiscountCode,
      removeDiscountCode,
      hasValidDiscount,
      calculateDiscountedTotal,
      discountAmount
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