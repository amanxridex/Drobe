'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PRODUCTS } from '@/data/catalog';
import { supabase } from '@/app/lib/supabaseClient';

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

export interface UserSession {
  id?: string;
  email?: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  drobeCash: number;
  knotCash: number;
  token?: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export const CENTRAL_WAREHOUSE = {
  name: 'Ahmedabad Central Darkstore Hub #01',
  code: 'AMD-HUB-01',
  address: 'Shivam Bungalows 1, Koteshwar / Motera, Ahmedabad',
  lat: 23.1033664,
  lng: 72.6043396
};

/**
 * Calculates real driving distance and delivery ETA between the Central Darkstore Warehouse and user coordinates
 */
export function calculateRealDistanceAndEta(destLat: number, destLng: number) {
  const R = 6371; // Earth radius in km
  const dLat = (destLat - CENTRAL_WAREHOUSE.lat) * (Math.PI / 180);
  const dLng = (destLng - CENTRAL_WAREHOUSE.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(CENTRAL_WAREHOUSE.lat * (Math.PI / 180)) *
    Math.cos(destLat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Real urban road winding multiplier (~28% street curves)
  const roadKm = Math.round((straightKm * 1.28) * 10) / 10;

  // Base runner dispatch pack time (5 min) + scooter transit at 24 km/h
  // Kept between 10m to 35m for local express zone
  const minutes = Math.max(10, Math.min(38, Math.round(5 + (roadKm / 24) * 60)));

  return {
    roadDistanceKm: roadKm,
    deliveryMinutes: minutes
  };
}

interface AppContextType {
  gender: 'men' | 'women';
  setGender: (g: 'men' | 'women') => void;
  location: string;
  setLocation: (loc: string) => void;
  setLocationWithCoords: (address: string, coords?: GeoCoordinates) => void;
  userCoords: GeoCoordinates | null;
  setUserCoords: React.Dispatch<React.SetStateAction<GeoCoordinates | null>>;
  deliveryMinutes: number;
  deliveryDistanceKm: number;
  isLocating: boolean;
  locationError: string | null;
  requestExactLocation: () => Promise<{ success: boolean; address?: string; coords?: GeoCoordinates; minutes?: number; error?: string }>;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isCouponOpen: boolean;
  setIsCouponOpen: (open: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: string, trialMode?: 'tryAndBuy' | 'standard') => boolean;
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
  user: UserSession | null;
  setUser: React.Dispatch<React.SetStateAction<UserSession | null>>;
  loginUser: (phone: string, name?: string) => void;
  logoutUser: () => Promise<void>;
  signUpWithEmail: (data: { email: string; password: string; phone: string; name: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  requireAuth: (callback?: () => void) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gender, setGenderState] = useState<'men' | 'women'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_gender') as 'men' | 'women';
        if (saved === 'men' || saved === 'women') return saved;
      } catch (e) {}
    }
    return 'men';
  });

  const setGender = (g: 'men' | 'women') => {
    setGenderState(g);
    try {
      localStorage.setItem('drobe_gender', g);
    } catch (e) {}
  };

  const [location, setLocationState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_user_location');
        if (saved) return saved;
      } catch (e) {}
    }
    return 'Koteshwar / Motera, Ahmedabad';
  });

  const [userCoords, setUserCoords] = useState<GeoCoordinates | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_user_coords');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return { lat: 23.1100, lng: 72.5920 };
  });

  const [deliveryMinutes, setDeliveryMinutes] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_delivery_minutes');
        if (saved) return parseInt(saved, 10);
      } catch (e) {}
    }
    return 14;
  });

  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_delivery_distance');
        if (saved) return parseFloat(saved);
      } catch (e) {}
    }
    return 2.1;
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setLocation = (loc: string) => {
    setLocationState(loc);
    try {
      localStorage.setItem('drobe_user_location', loc);
    } catch (e) {}
  };

  const setLocationWithCoords = (address: string, coords?: GeoCoordinates) => {
    setLocation(address);
    if (coords) {
      setUserCoords(coords);
      const eta = calculateRealDistanceAndEta(coords.lat, coords.lng);
      setDeliveryMinutes(eta.deliveryMinutes);
      setDeliveryDistanceKm(eta.roadDistanceKm);
      try {
        localStorage.setItem('drobe_user_coords', JSON.stringify(coords));
        localStorage.setItem('drobe_delivery_minutes', eta.deliveryMinutes.toString());
        localStorage.setItem('drobe_delivery_distance', eta.roadDistanceKm.toString());
      } catch (e) {}
    }
  };

  const requestExactLocation = async (): Promise<{
    success: boolean;
    address?: string;
    coords?: GeoCoordinates;
    minutes?: number;
    error?: string;
  }> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      const err = 'GPS location is not supported on this device/browser.';
      setLocationError(err);
      return { success: false, error: err };
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords: GeoCoordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          };

          const eta = calculateRealDistanceAndEta(coords.lat, coords.lng);
          let detectedAddress = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;

          try {
            // Real OpenStreetMap Nominatim reverse geocode
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
              {
                headers: { 'Accept-Language': 'en' }
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const a = data.address;
                const road = a.road || a.pedestrian || a.suburb || a.neighbourhood || a.residential || '';
                const area = a.city_district || a.suburb || a.locality || a.neighbourhood || '';
                const city = a.city || a.town || a.village || a.state_district || 'Ahmedabad';
                const pincode = a.postcode ? ` - ${a.postcode}` : '';

                if (road && area && road !== area) {
                  detectedAddress = `${road}, ${area}, ${city}${pincode}`;
                } else if (road) {
                  detectedAddress = `${road}, ${city}${pincode}`;
                } else if (area) {
                  detectedAddress = `${area}, ${city}${pincode}`;
                } else if (data.name) {
                  detectedAddress = `${data.name}, ${city}${pincode}`;
                } else {
                  detectedAddress = `${city}${pincode}`;
                }
              }
            }
          } catch (e) {
            console.warn('Reverse geocode fetch warning:', e);
          }

          setLocationState(detectedAddress);
          setUserCoords(coords);
          setDeliveryMinutes(eta.deliveryMinutes);
          setDeliveryDistanceKm(eta.roadDistanceKm);
          setIsLocating(false);

          try {
            localStorage.setItem('drobe_user_location', detectedAddress);
            localStorage.setItem('drobe_user_coords', JSON.stringify(coords));
            localStorage.setItem('drobe_delivery_minutes', eta.deliveryMinutes.toString());
            localStorage.setItem('drobe_delivery_distance', eta.roadDistanceKm.toString());
          } catch (e) {}

          resolve({
            success: true,
            address: detectedAddress,
            coords,
            minutes: eta.deliveryMinutes
          });
        },
        (err) => {
          setIsLocating(false);
          let msg = 'Could not access GPS location.';
          if (err.code === 1) msg = 'Location permission was denied. Please allow location in your browser/device settings.';
          else if (err.code === 2) msg = 'GPS position is currently unavailable.';
          else if (err.code === 3) msg = 'Location request timed out.';
          setLocationError(msg);
          resolve({ success: false, error: msg });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  
  // Real live cart initialized empty (no fake preloaded bags)
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_cart_live');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Real live wishlist initialized empty
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_wishlist_live');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_user_orders_live');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drobe_user_session');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Sync with Supabase Auth Session on mount
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser(prev => ({
          id: session.user.id,
          email: session.user.email || prev?.email || '',
          name: meta.name || prev?.name || session.user.email?.split('@')[0] || 'Verified Shopper',
          phone: meta.phone || prev?.phone || '',
          avatarUrl: meta.avatar_url || prev?.avatarUrl || '',
          drobeCash: prev?.drobeCash ?? 250,
          knotCash: prev?.knotCash ?? 250,
          token: session.access_token
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: meta.name || session.user.email?.split('@')[0] || 'Verified Shopper',
          phone: meta.phone || '',
          avatarUrl: meta.avatar_url || '',
          drobeCash: 250,
          knotCash: 250,
          token: session.access_token
        });
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('drobe_user_session');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Persist cart to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drobe_cart_live', JSON.stringify(cart));
      } catch (e) {}
    }
  }, [cart]);

  // Persist wishlist to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drobe_wishlist_live', JSON.stringify(wishlist));
      } catch (e) {}
    }
  }, [wishlist]);

  // Persist orders to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drobe_user_orders_live', JSON.stringify(orders));
      } catch (e) {}
    }
  }, [orders]);

  // Persist user session to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem('drobe_user_session', JSON.stringify(user));
        } else {
          localStorage.removeItem('drobe_user_session');
        }
      } catch (e) {}
    }
  }, [user]);

  const addToCart = (product: Product, size: string, trialMode: 'tryAndBuy' | 'standard' = 'tryAndBuy'): boolean => {
    if (!user) {
      setIsAuthOpen(true);
      return false;
    }
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
    return true;
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
    if (
      clean === 'DROBEFESTIVE999' ||
      clean === 'DROBE150' ||
      clean === 'HEXAFUNXDROBE' ||
      clean === 'DROBE250' ||
      clean === 'KNOTFESTIVE999' ||
      clean === 'KNOT150' ||
      clean === 'HEXAFUNXKNOT' ||
      clean === 'KNOT250'
    ) {
      setAppliedCoupon(clean);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.includes('999')
      ? 200
      : appliedCoupon.includes('150')
      ? 150
      : 250
    : 0;
  const cartTotal = Math.max(0, rawSubtotal - discountAmount);

  const createOrder = (paymentMethod: string): Order => {
    const newOrder: Order = {
      id: `DROBE-${Math.floor(100000 + Math.random() * 900000)}`,
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

  const requireAuth = (callback?: () => void): boolean => {
    if (user) {
      if (callback) callback();
      return true;
    }
    setIsAuthOpen(true);
    return false;
  };

  const signUpWithEmail = async (data: {
    email: string;
    password: string;
    phone: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.email || !data.password || !data.phone || !data.name) {
        return { success: false, error: 'Please enter your name, email, phone number, and password' };
      }
      if (data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      let userId = `usr_${Date.now()}`;
      let token = '';

      if (supabase) {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              name: data.name.trim(),
              phone: data.phone.trim(),
              avatar_url: data.avatarUrl || ''
            }
          }
        });

        if (authErr) {
          if (authErr.message.toLowerCase().includes('already registered')) {
            return { success: false, error: 'This email is already registered. Please sign in.' };
          }
          return { success: false, error: authErr.message };
        }

        if (authData.user?.id) userId = authData.user.id;
        if (authData.session?.access_token) token = authData.session.access_token;

        try {
          await supabase.from('drobe_profiles').upsert({
            id: userId,
            email: data.email.trim(),
            phone: data.phone.trim(),
            name: data.name.trim(),
            avatar_url: data.avatarUrl || '',
            drobe_cash: 250,
            knot_cash: 250,
            updated_at: new Date().toISOString()
          });
        } catch {}
      }

      const newSession: UserSession = {
        id: userId,
        email: data.email.trim(),
        name: data.name.trim(),
        phone: data.phone.trim(),
        avatarUrl: data.avatarUrl || '',
        drobeCash: 250,
        knotCash: 250,
        token
      };

      setUser(newSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem('drobe_user_session', JSON.stringify(newSession));
      }
      setIsAuthOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Sign up failed. Please try again.' };
    }
  };

  const signInWithEmail = async (data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.email || !data.password) {
        return { success: false, error: 'Please enter your email and password' };
      }

      if (supabase) {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password
        });

        if (authErr) {
          return { success: false, error: authErr.message || 'Invalid email or password' };
        }

        const sbUser = authData.user;
        const meta = sbUser?.user_metadata || {};
        let profileName = meta.name;
        let profilePhone = meta.phone;
        let profileAvatar = meta.avatar_url;
        let drobeCash = 250;
        let knotCash = 250;

        try {
          const { data: prof } = await supabase
            .from('drobe_profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single();
          if (prof) {
            profileName = prof.name || profileName;
            profilePhone = prof.phone || profilePhone;
            profileAvatar = prof.avatar_url || profileAvatar;
            drobeCash = prof.drobe_cash ?? 250;
            knotCash = prof.knot_cash ?? 250;
          }
        } catch {}

        const newSession: UserSession = {
          id: sbUser.id,
          email: sbUser.email || data.email.trim(),
          name: profileName || sbUser.email?.split('@')[0] || 'Verified Shopper',
          phone: profilePhone || '',
          avatarUrl: profileAvatar || '',
          drobeCash,
          knotCash,
          token: authData.session?.access_token || ''
        };

        setUser(newSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem('drobe_user_session', JSON.stringify(newSession));
        }
        setIsAuthOpen(false);
        return { success: true };
      } else {
        const newSession: UserSession = {
          id: `usr_${Date.now()}`,
          email: data.email.trim(),
          name: data.email.split('@')[0],
          phone: '+91 98250 88123',
          avatarUrl: '',
          drobeCash: 250,
          knotCash: 250
        };
        setUser(newSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem('drobe_user_session', JSON.stringify(newSession));
        }
        setIsAuthOpen(false);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const loginUser = (phone: string, name?: string) => {
    const newSession: UserSession = {
      name: name || ('User ' + phone.slice(-4)),
      phone,
      drobeCash: 250,
      knotCash: 250
    };
    setUser(newSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem('drobe_user_session', JSON.stringify(newSession));
    }
    setIsAuthOpen(false);
  };

  const logoutUser = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('drobe_user_session');
    }
  };

  return (
    <AppContext.Provider
      value={{
        gender,
        setGender,
        location,
        setLocation,
        setLocationWithCoords,
        userCoords,
        setUserCoords,
        deliveryMinutes,
        deliveryDistanceKm,
        isLocating,
        locationError,
        requestExactLocation,
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
        setUser,
        loginUser,
        logoutUser,
        signUpWithEmail,
        signInWithEmail,
        requireAuth
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
