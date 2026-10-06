'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PRODUCTS } from '@/data/catalog';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
  trialMode: 'tryAndBuy' | 'standard';
}

export interface Order {
  id: string;
  items: {
    item: CartItem;
    status: 'pending' | 'kept' | 'returned';
  }[];
  totalAmount: number;
  deliveryMinutes: number;
  createdAt: string;
  status: 'packed' | 'out_for_delivery' | 'arrived' | 'completed';
  trialSecondsRemaining: number;
  deliveryAddress: string;
}

interface AppContextType {
  gender: 'men' | 'women';
  setGender: (g: 'men' | 'women') => void;
  location: string;
  setLocation: (loc: string) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isCouponOpen: boolean;
  setIsCouponOpen: (open: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: string, trialMode?: 'tryAndBuy' | 'standard') => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  cartTotal: number;
  orders: Order[];
  createOrder: (paymentMethod: string) => Order;
  updateDoorstepStatus: (orderId: string, itemIdx: number, action: 'kept' | 'returned') => void;
  user: { name: string; phone: string; knotCash: number } | null;
  loginUser: (phone: string) => void;
  logoutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [location, setLocation] = useState<string>('Shreepal Complex, Suren Rd, Mumbai');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('KNOTFESTIVE999');
  
  // Default cart preloaded with authentic item
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      size: 'L',
      quantity: 1,
      trialMode: 'tryAndBuy'
    }
  ]);

  const [wishlist, setWishlist] = useState<string[]>([PRODUCTS[1].id]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<{ name: string; phone: string; knotCash: number } | null>(null);

  const addToCart = (product: Product, size: string, trialMode: 'tryAndBuy' | 'standard' = 'tryAndBuy') => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1, trialMode }
            : i
        );
      }
      return [...prev, { product, size, quantity: 1, trialMode }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId && i.size === size) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const applyCoupon = (code: string) => {
    const clean = code.toUpperCase();
    if (clean === 'KNOTFESTIVE999' || clean === 'KNOT150' || clean === 'HEXAFUNXKNOT' || clean === 'KNOT250') {
      setAppliedCoupon(clean);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (appliedCoupon === 'KNOTFESTIVE999' ? 200 : appliedCoupon === 'KNOT150' ? 150 : 250) : 0;
  const cartTotal = Math.max(0, rawSubtotal - discountAmount);

  const createOrder = (paymentMethod: string): Order => {
    const newOrder: Order = {
      id: `KNOT-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart.map((i) => ({ item: i, status: 'pending' })),
      totalAmount: cartTotal,
      deliveryMinutes: 60,
      createdAt: new Date().toISOString(),
      status: 'out_for_delivery',
      trialSecondsRemaining: 900,
      deliveryAddress: location
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const updateDoorstepStatus = (orderId: string, itemIdx: number, action: 'kept' | 'returned') => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedItems = [...order.items];
          updatedItems[itemIdx] = { ...updatedItems[itemIdx], status: action };
          return { ...order, items: updatedItems };
        }
        return order;
      })
    );
  };

  const loginUser = (phone: string) => {
    setUser({
      name: 'User ' + phone.slice(-4),
      phone,
      knotCash: 250
    });
    setIsAuthOpen(false);
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        gender,
        setGender,
        location,
        setLocation,
        isLocationOpen,
        setIsLocationOpen,
        isAuthOpen,
        setIsAuthOpen,
        isCouponOpen,
        setIsCouponOpen,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        wishlist,
        toggleWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        cartTotal,
        orders,
        createOrder,
        updateDoorstepStatus,
        user,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
