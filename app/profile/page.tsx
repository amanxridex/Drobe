'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrialOrders, TrialOrder } from '@/app/lib/darkstoreData';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Lock,
  Shirt,
  Bell,
  Sliders,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Download,
  X,
  Smartphone,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  Tag,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

// Apple System Font Stack
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system-subheadline, "Helvetica Neue", Helvetica, Arial, sans-serif';

type ActiveSheetType = 
  | 'personalInfo'
  | 'orders'
  | 'addresses'
  | 'payments'
  | 'fashionPreferences'
  | 'notifications'
  | 'generalSettings'
  | 'helpSupport'
  | 'loginSecurity'
  | 'deleteAccount'
  | null;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser, wishlist, orders: contextOrders } = useApp();

  // Active Bottom Sheet Modal
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

  // Theme: 'light' (Default clean white-theme requested by user) | 'dark' | 'system'
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [systemDark, setSystemDark] = useState(false);

  // User Profile Data
  const [userData, setUserData] = useState({
    name: user?.name || 'Aman Mishra',
    email: 'aman@example.com',
    phone: user?.phone || '+91 98250 88123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    hubZone: 'Ahmedabad Darkstore Hub #01 (SG Highway)'
  });

  // Saved Addresses
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      tag: 'Home',
      recipient: 'Aman Mishra',
      line1: 'B-702, Shaligram Plus, Opp. Iskcon Temple',
      line2: 'SG Highway, Ahmedabad, Gujarat',
      pincode: '380015',
      phone: '+91 98250 88123',
      isDefault: true
    },
    {
      id: 'addr-2',
      tag: 'Work',
      recipient: 'Aman Mishra',
      line1: 'Floor 4, Commerce House 5, Anand Nagar Rd',
      line2: 'Prahlad Nagar, Ahmedabad, Gujarat',
      pincode: '380051',
      phone: '+91 98250 88123',
      isDefault: false
    }
  ]);

  // Saved Payments
  const [upiId, setUpiId] = useState('aman@okhdfcbank');
  const [savedCards, setSavedCards] = useState([
    { id: 'card-1', bank: 'HDFC Bank', type: 'Visa', last4: '4028', expiry: '08/29' },
    { id: 'card-2', bank: 'ICICI Bank', type: 'Mastercard', last4: '9102', expiry: '11/28' }
  ]);

  // Payment & Refund History
  const refundHistory = [
    {
      id: 'RFD-4102',
      orderId: 'DRB-9842',
      amount: '₹1,499',
      method: 'UPI (aman@okhdfcbank)',
      status: 'Instant Doorstep Refund Successful',
      time: 'Today, 2:45 PM'
    },
    {
      id: 'RFD-3918',
      orderId: 'DRB-9710',
      amount: '₹1,999',
      method: 'HDFC Card •••• 4028',
      status: 'Refund Settled',
      time: 'Oct 04, 2026'
    }
  ];

  // Invoices & Receipts
  const invoices = [
    { id: 'INV-2026-9842', orderId: 'DRB-9842', date: 'Oct 15, 2026', amount: '₹2,899', items: 'Mark Leute Heavy Oversized Hoodie (L)' },
    { id: 'INV-2026-9710', orderId: 'DRB-9710', date: 'Oct 12, 2026', amount: '₹1,999', items: 'Tilt Utility Cargo (32)' }
  ];

  // Fashion Preferences (DROBE Differentiator)
  const [fashionPrefs, setFashionPrefs] = useState({
    styles: ['Streetwear', 'Casual', 'Minimal', 'Oversized'],
    topSize: 'L',
    bottomSize: '32',
    footwearSize: 'UK 9',
    preferredFit: 'Relaxed',
    brands: ['SNITCH', 'The Souled Store', 'Tilt', 'Mark Leute'],
    colors: ['Black & Neutrals', 'Earthy Tones', 'Monochrome']
  });

  // Orders Tab Filter
  const [orderTab, setOrderTab] = useState<'all' | 'live' | 'returns' | 'coupons'>('all');

  // Coupons & Offers
  const coupons = [
    { code: 'DROBE30', discount: '₹500 OFF', desc: 'Valid on first 30-min express trial order above ₹1,999', expiry: 'Expires in 6 days' },
    { code: 'FASHION30', discount: 'FREE 6-MIN TRIAL', desc: 'Complimentary doorstep fitting trial on all brands', expiry: 'Active' },
    { code: 'DROBEDROP', discount: '15% OFF', desc: 'Special drop bonus for indie streetwear collections', expiry: 'Active' }
  ];

  // Notifications Preferences
  const [notifs, setNotifs] = useState({
    orderTracking: true,
    doorstepTimer: true,
    flashDrops: true,
    whatsappUpdates: true,
    smsAlerts: false
  });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'English (IN)',
    personalizedRecommendations: true,
    locationPermission: true,
    emailMarketing: false,
    smsMarketing: false
  });

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Trial Orders from Darkstore
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>([]);

  useEffect(() => {
    try {
      const orders = getTrialOrders();
      if (orders && orders.length > 0) {
        setTrialOrders(orders);
      }
      const savedTheme = localStorage.getItem('drobe_profile_theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setTheme(savedTheme as any);
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemDark(mq.matches);
      const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  const handleToggleTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    try {
      localStorage.setItem('drobe_profile_theme', t);
    } catch {}
    const label = t === 'light' ? 'Light Theme' : t === 'dark' ? 'Dark Theme' : 'Device System Settings';
    showToast(`Visual Theme: ${label}`);
  };

  // Dynamic Theme Palette (White theme default as requested)
  const isLight = theme === 'light' || (theme === 'system' && !systemDark);
  const colors = {
    bg: isLight ? '#f8f8fa' : '#0d0d12',
    cardBg: isLight ? '#ffffff' : '#16161c',
    textPrimary: isLight ? '#111115' : '#ffffff',
    textSecondary: isLight ? '#6b7280' : '#8e8e93',
    textMuted: isLight ? '#9ca3af' : '#71717a',
    divider: isLight ? '#f0f0f4' : '#23232c',
    border: isLight ? '#e5e5ea' : '#272733',
    rowHover: isLight ? '#f2f2f7' : '#1e1e26',
    pillBg: isLight ? '#f0f0f4' : '#202028',
    accent: '#000000',
    accentText: '#ffffff'
  };

  const handleLogout = () => {
    logoutUser();
    showToast('Logged out securely');
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  const handleLogoutAllDevices = () => {
    showToast('Logged out of all active mobile and desktop sessions.');
  };

  const handleDownloadData = () => {
    try {
      const exportData = {
        profile: userData,
        addresses,
        fashionPreferences: fashionPrefs,
        savedPayments: { upiId, tokenizedCards: savedCards.map(c => ({ bank: c.bank, type: c.type, last4: c.last4 })) },
        orders: trialOrders,
        refundHistory,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drobe_account_data_aman.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Account data exported successfully!');
    } catch {
      showToast('Account data export prepared');
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: colors.bg,
        color: colors.textPrimary,
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              right: 20,
              zIndex: 100,
              background: isLight ? '#111115' : '#1f1f28',
              color: '#ffffff',
              border: isLight ? 'none' : '1px solid #333342',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 90px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* ====================================================================
            TOP HEADER: DROBE USER IDENTITY & HERO ROW
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: colors.textPrimary,
                margin: 0,
                letterSpacing: '-0.02em'
              }}
            >
              My Account
            </h1>

            {/* Subtle Concierge Support Link */}
            <motion.a
              href="https://wa.me/919825088123"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: colors.textPrimary,
                textDecoration: 'none'
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span>Help</span>
            </motion.a>
          </div>

          {/* User Card: Avatar, Name, Email, Edit Profile */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 18,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={userData.avatar}
                alt={userData.name}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${colors.border}`
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: colors.textPrimary, letterSpacing: '-0.01em' }}>
                    {userData.name}
                  </h2>
                  <CheckCircle2 size={16} color="#22c55e" fill="#22c55e" strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {userData.email}
                </div>
              </div>
            </div>

            {/* Edit Profile Link */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveSheet('personalInfo')}
              style={{
                background: colors.pillBg,
                border: 'none',
                padding: '7px 13px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                color: colors.textPrimary,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              Edit
            </motion.button>
          </div>

          {/* Quick Action Trio: Orders · Wishlist · Addresses */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginTop: 12
            }}
          >
            {/* Orders */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveSheet('orders')}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <Package size={18} color={isLight ? '#111' : '#fff'} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: colors.textPrimary }}>Orders</div>
              <div style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 1 }}>Track purchases</div>
            </motion.button>

            {/* Wishlist */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/trends')}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <Heart size={18} color={isLight ? '#111' : '#fff'} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: colors.textPrimary }}>Wishlist</div>
              <div style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 1 }}>Saved items</div>
            </motion.button>

            {/* Addresses */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveSheet('addresses')}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.02)' : 'none'
              }}
            >
              <MapPin size={18} color={isLight ? '#111' : '#fff'} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: colors.textPrimary }}>Addresses</div>
              <div style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 1 }}>Manage delivery</div>
            </motion.button>
          </div>
        </div>

        {/* ====================================================================
            SECTION 1: ACCOUNT
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: colors.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingLeft: 4
            }}
          >
            ACCOUNT
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
            }}
          >
            {/* Personal information */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('personalInfo')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <User size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Personal information
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Name, email, mobile number, profile photo
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* My orders */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('orders')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Package size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    My orders
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Current, completed and cancelled orders
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0284c7', background: isLight ? '#e0f2fe' : '#102a3a', padding: '2px 8px', borderRadius: 10 }}>
                  30-Min Live
                </span>
                <ChevronRight size={18} color={colors.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Wishlist */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => router.push('/trends')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Heart size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Wishlist
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Products saved for later
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>
                  {wishlist.length} items
                </span>
                <ChevronRight size={18} color={colors.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Saved addresses */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('addresses')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Saved addresses
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Home, work, other addresses, default address
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: colors.textSecondary }}>
                  Home (Default)
                </span>
                <ChevronRight size={18} color={colors.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Payments & refunds */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('payments')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CreditCard size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Payments & refunds
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Saved UPI, cards, doorstep refund history & invoices
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Login & security */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('loginSecurity')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Lock size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Login & security
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Passkeys, OTP verification, active sessions
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 2: PREFERENCES
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: colors.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingLeft: 4
            }}
          >
            PREFERENCES
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
            }}
          >
            {/* Fashion preferences (DROBE special) */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('fashionPreferences')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Shirt size={18} color={colors.textPrimary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Fashion preferences
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Preferred styles, sizes, fits & favourite brands
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: isLight ? '#000' : '#d4f938', background: colors.pillBg, padding: '2px 8px', borderRadius: 8 }}>
                  {fashionPrefs.styles[0]} • {fashionPrefs.topSize}
                </span>
                <ChevronRight size={18} color={colors.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Notifications */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('notifications')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Bell size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Notifications
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    30-min delivery, new brand drops & WhatsApp alerts
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* General settings */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('generalSettings')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sliders size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    General settings
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Theme (Light / Dark / Device), language & recommendations
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' }}>
                  {theme}
                </span>
                <ChevronRight size={18} color={colors.textMuted} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 3: SUPPORT & LEGAL
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: colors.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingLeft: 4
            }}
          >
            SUPPORT & LEGAL
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
            }}
          >
            {/* Help & support */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('helpSupport')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <HelpCircle size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Help & support
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    FAQs, 24/7 concierge, order & doorstep trial assistance
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Privacy & security */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => showToast('Privacy Policy: All customer data is encrypted & tokenized.')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Privacy & security
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Tokenized payment protection, data download & consent
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Terms & policies */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => showToast('DROBE: 100% Verified Authentic SKUs & 30-Min Doorstep Trial Guarantee.')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={18} color={colors.textSecondary} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    Terms & policies
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>
                    Terms of service, zero-prepay cancellation & refund policy
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 4: ACCOUNT CONTROLS
            ==================================================================== */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: colors.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingLeft: 4
            }}
          >
            ACCOUNT CONTROLS
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
            }}
          >
            {/* Log out */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={handleLogout}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LogOut size={18} color="#ef4444" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
                  Log out
                </span>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Log out of all devices */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={handleLogoutAllDevices}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Smartphone size={18} color={colors.textSecondary} />
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                  Log out of all devices
                </span>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Download my data */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={handleDownloadData}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Download size={18} color={colors.textSecondary} />
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                  Download my data
                </span>
              </div>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: colors.divider, margin: '0 16px' }} />

            {/* Delete Account */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: colors.rowHover }}
              onClick={() => setActiveSheet('deleteAccount')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>
                Delete my account
              </span>
              <ChevronRight size={18} color={colors.textMuted} />
            </motion.div>
          </div>

          {/* App Version Diagnostics */}
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <p style={{ fontSize: 11, color: colors.textMuted, margin: 0 }}>
              DROBE v2.4.1 (Ahmedabad Darkstore Hub #01 Build 942)
            </p>
          </div>
        </div>
      </main>

      {/* ====================================================================
          INTERACTIVE SLIDE-OVER SHEETS / MODALS
          ==================================================================== */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}
            onClick={() => setActiveSheet(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              style={{
                background: colors.cardBg,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTop: `1px solid ${colors.border}`,
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: colors.textPrimary,
                fontFamily: FONT_FAMILY
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header Handle */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  background: isLight ? '#d1d1d6' : '#3a3a44',
                  borderRadius: 2,
                  margin: '10px auto 14px'
                }}
              />

              {/* SHEET 1: PERSONAL INFORMATION */}
              {activeSheet === 'personalInfo' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Personal Information</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); setActiveSheet(null); showToast('Profile details updated!'); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>Full Name</label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: isLight ? '#f4f4f7' : '#0e0e12',
                            border: `1px solid ${colors.border}`,
                            color: colors.textPrimary,
                            fontSize: 14,
                            fontWeight: 600,
                            outline: 'none',
                            fontFamily: FONT_FAMILY
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>Email Address</label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: isLight ? '#f4f4f7' : '#0e0e12',
                            border: `1px solid ${colors.border}`,
                            color: colors.textPrimary,
                            fontSize: 14,
                            fontWeight: 600,
                            outline: 'none',
                            fontFamily: FONT_FAMILY
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>Mobile Number (Doorstep Verification)</label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: isLight ? '#f4f4f7' : '#0e0e12',
                            border: `1px solid ${colors.border}`,
                            color: colors.textPrimary,
                            fontSize: 14,
                            fontWeight: 600,
                            outline: 'none',
                            fontFamily: FONT_FAMILY
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>Assigned Rapid Darkstore Hub</label>
                        <div
                          style={{
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: isLight ? '#f4f4f7' : '#0e0e12',
                            border: `1px solid ${colors.border}`,
                            color: colors.textSecondary,
                            fontSize: 13,
                            fontWeight: 600
                          }}
                        >
                          {userData.hubZone}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%',
                        padding: '14px 0',
                        borderRadius: 14,
                        background: colors.textPrimary,
                        color: colors.cardBg,
                        fontSize: 14,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Save Changes
                    </motion.button>
                  </form>
                </div>
              )}

              {/* SHEET 2: SHOPPING & ORDERS */}
              {activeSheet === 'orders' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Shopping & Orders</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Orders Sub-Tabs */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                    {[
                      { key: 'all', label: 'All Orders' },
                      { key: 'live', label: '30-Min Live' },
                      { key: 'returns', label: 'Returns & Refunds' },
                      { key: 'coupons', label: 'Coupons' }
                    ].map(tab => (
                      <motion.button
                        key={tab.key}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setOrderTab(tab.key as any)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          background: orderTab === tab.key ? colors.textPrimary : colors.pillBg,
                          color: orderTab === tab.key ? colors.cardBg : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Tab 1 & 2: Active / All Orders */}
                  {(orderTab === 'all' || orderTab === 'live') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {trialOrders.length > 0 ? (
                        trialOrders.map((o) => (
                          <div
                            key={o.id}
                            style={{
                              background: isLight ? '#f9f9fb' : '#121217',
                              border: `1px solid ${colors.border}`,
                              borderRadius: 14,
                              padding: 14
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#0284c7' }}>
                                {o.orderNumber || o.id}
                              </span>
                              <span style={{ fontSize: 11, color: colors.textMuted }}>
                                {o.dispatchedAt || 'Today'}
                              </span>
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 2 }}>
                              {o.status}
                            </div>

                            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
                              {o.brandName} • {o.productName} ({o.size}) • {o.price}
                            </div>

                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              onClick={() => {
                                setActiveSheet(null);
                                router.push(`/order/${o.id}`);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 0',
                                borderRadius: 10,
                                background: colors.textPrimary,
                                color: colors.cardBg,
                                fontSize: 12.5,
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Live 30-Min Location Tracking Map
                            </motion.button>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                          <ShoppingBag size={36} color={colors.textMuted} style={{ margin: '0 auto 10px' }} />
                          <div style={{ fontSize: 14, fontWeight: 700 }}>No active orders</div>
                          <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                            Your 30-min express trial fits will appear here.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Returns & Refunds */}
                  {orderTab === 'returns' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div
                        style={{
                          background: isLight ? '#f9f9fb' : '#121217',
                          border: `1px solid ${colors.border}`,
                          borderRadius: 14,
                          padding: 14
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                            ✓ Refund Settled Instantly
                          </span>
                          <span style={{ fontSize: 11, color: colors.textMuted }}>Today, 2:45 PM</span>
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary }}>
                          Order #DRB-9842 (Mark Leute Heavy Hoodie Size XL)
                        </div>
                        <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                          Returned during 6-min doorstep trial window. ₹1,499 credited instantly via UPI to {upiId}.
                        </div>
                      </div>

                      <div
                        style={{
                          background: isLight ? '#f9f9fb' : '#121217',
                          border: `1px solid ${colors.border}`,
                          borderRadius: 14,
                          padding: 14
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                            Size Swap Completed
                          </span>
                          <span style={{ fontSize: 11, color: colors.textMuted }}>Oct 12, 2026</span>
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary }}>
                          Order #DRB-9710 (Tilt Utility Cargo)
                        </div>
                        <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                          Direct size swap (34 → 32) handed over by doorstep runner.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Coupons & Offers */}
                  {orderTab === 'coupons' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {coupons.map(c => (
                        <div
                          key={c.code}
                          style={{
                            background: isLight ? '#f9f9fb' : '#121217',
                            border: `1px dashed ${colors.border}`,
                            borderRadius: 14,
                            padding: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.04em' }}>{c.code}</span>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', background: isLight ? '#dcfce7' : '#064e3b', padding: '2px 6px', borderRadius: 6 }}>
                                {c.discount}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 3 }}>{c.desc}</div>
                            <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>{c.expiry}</div>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => showToast(`Coupon ${c.code} copied!`)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: colors.pillBg,
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 700,
                              color: colors.textPrimary,
                              cursor: 'pointer'
                            }}
                          >
                            Copy
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SHEET 3: SAVED ADDRESSES */}
              {activeSheet === 'addresses' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Saved Delivery Addresses</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          background: isLight ? '#f9f9fb' : '#121217',
                          border: addr.isDefault ? `1.5px solid ${colors.textPrimary}` : `1px solid ${colors.border}`,
                          borderRadius: 14,
                          padding: 14
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, background: colors.pillBg, padding: '2px 8px', borderRadius: 6 }}>
                            {addr.tag}
                          </span>
                          {addr.isDefault && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Default Address ✓</span>
                          )}
                        </div>

                        <div style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary }}>
                          {addr.recipient}
                        </div>
                        <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 1.4 }}>
                          {addr.line1}, {addr.line2} - {addr.pincode}
                        </div>
                        <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 4 }}>
                          Phone: {addr.phone}
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => showToast('Address selection saved for 30-min express deliveries!')}
                    style={{
                      width: '100%',
                      padding: '13px 0',
                      borderRadius: 14,
                      background: colors.textPrimary,
                      color: colors.cardBg,
                      fontSize: 13.5,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Add New Address
                  </motion.button>
                </div>
              )}

              {/* SHEET 4: PAYMENTS & BILLING */}
              {activeSheet === 'payments' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Payments & Billing</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Instant Doorstep UPI VPA */}
                  <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>
                      ⚡ Instant Doorstep Refund VPA
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                      {upiId}
                    </div>
                    <p style={{ fontSize: 11.5, color: colors.textSecondary, margin: '4px 0 10px 0' }}>
                      When you return unkept trial fits at your doorstep, refunds are credited instantly to this UPI ID upon runner scan.
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showToast('UPI VPA verified and active for instant refunds')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: colors.pillBg,
                        border: 'none',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        cursor: 'pointer'
                      }}
                    >
                      Edit UPI ID
                    </motion.button>
                  </div>

                  {/* Tokenized Cards */}
                  <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                      Tokenized Cards (RBI Compliant)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {savedCards.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.bank} {c.type} •••• {c.last4}</div>
                            <div style={{ fontSize: 11, color: colors.textSecondary }}>Expires {c.expiry}</div>
                          </div>
                          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>Tokenized ✓</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doorstep Refund History */}
                  <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                      Doorstep Refund History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {refundHistory.map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{r.orderId} • {r.amount}</div>
                            <div style={{ fontSize: 11, color: colors.textSecondary }}>{r.method}</div>
                            <div style={{ fontSize: 10.5, color: '#10b981', fontWeight: 600 }}>{r.status}</div>
                          </div>
                          <span style={{ fontSize: 10.5, color: colors.textMuted }}>{r.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoices & Receipts */}
                  <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                      Invoices & Receipts
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {invoices.map(inv => (
                        <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{inv.id} ({inv.amount})</div>
                            <div style={{ fontSize: 11, color: colors.textSecondary }}>{inv.items} • {inv.date}</div>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => showToast(`Downloaded invoice ${inv.id}.pdf`)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              background: colors.pillBg,
                              border: 'none',
                              fontSize: 11,
                              fontWeight: 700,
                              color: colors.textPrimary,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Download size={12} />
                            <span>PDF</span>
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 1.4 }}>
                    🔒 DROBE uses PCI-DSS Level 1 tokenization. Raw card numbers, CVVs, and UPI PINs are never stored in the database.
                  </div>
                </div>
              )}

              {/* SHEET 5: FASHION PREFERENCES (DROBE SPECIAL) */}
              {activeSheet === 'fashionPreferences' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Fashion Preferences</h3>
                      <p style={{ fontSize: 12, color: colors.textSecondary, margin: '2px 0 0 0' }}>
                        Personalize your 30-min doorstep trial catalog
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Preferred Styles */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      PREFERRED STYLES
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Streetwear', 'Casual', 'Minimal', 'Oversized', 'Ethnic', 'Formal', 'Athleisure', 'Partywear'].map(st => {
                        const isSelected = fashionPrefs.styles.includes(st);
                        return (
                          <motion.button
                            key={st}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                              setFashionPrefs(prev => ({
                                ...prev,
                                styles: isSelected ? prev.styles.filter(s => s !== st) : [...prev.styles, st]
                              }));
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: 20,
                              background: isSelected ? colors.textPrimary : colors.pillBg,
                              color: isSelected ? colors.cardBg : colors.textPrimary,
                              fontSize: 12.5,
                              fontWeight: isSelected ? 800 : 600,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {st}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      TOP SIZE (SHIRTS / POLOS / HOODIES)
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                        <motion.button
                          key={sz}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, topSize: sz }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.topSize === sz ? colors.textPrimary : colors.pillBg,
                            color: fashionPrefs.topSize === sz ? colors.cardBg : colors.textPrimary,
                            fontSize: 13,
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      BOTTOM SIZE (JEANS / TROUSERS / CARGOS)
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['28', '30', '32', '34', '36'].map(sz => (
                        <motion.button
                          key={sz}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, bottomSize: sz }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.bottomSize === sz ? colors.textPrimary : colors.pillBg,
                            color: fashionPrefs.bottomSize === sz ? colors.cardBg : colors.textPrimary,
                            fontSize: 13,
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Footwear Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      FOOTWEAR SIZE (SNEAKERS / LOAFERS)
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'].map(sz => (
                        <motion.button
                          key={sz}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, footwearSize: sz }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.footwearSize === sz ? colors.textPrimary : colors.pillBg,
                            color: fashionPrefs.footwearSize === sz ? colors.cardBg : colors.textPrimary,
                            fontSize: 12,
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Fit */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      PREFERRED FIT
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['Slim', 'Regular', 'Relaxed', 'Oversized'].map(fit => (
                        <motion.button
                          key={fit}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, preferredFit: fit }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.preferredFit === fit ? colors.textPrimary : colors.pillBg,
                            color: fashionPrefs.preferredFit === fit ? colors.cardBg : colors.textPrimary,
                            fontSize: 12,
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {fit}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Followed Indie Brands */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      FAVOURITE BRANDS (FOLLOW FOR NEW DROPS)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['SNITCH', 'The Souled Store', 'Tilt', 'Mark Leute', 'Bluorng', 'VegNonVeg', 'Urban Monkey', 'Huemn'].map(b => {
                        const isFav = fashionPrefs.brands.includes(b);
                        return (
                          <motion.button
                            key={b}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                              setFashionPrefs(prev => ({
                                ...prev,
                                brands: isFav ? prev.brands.filter(x => x !== b) : [...prev.brands, b]
                              }));
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: 20,
                              background: isFav ? colors.textPrimary : colors.pillBg,
                              color: isFav ? colors.cardBg : colors.textPrimary,
                              fontSize: 12,
                              fontWeight: isFav ? 800 : 600,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {isFav ? '✓ ' : '+ '}{b}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveSheet(null);
                      showToast('Fashion preferences updated! ✨');
                    }}
                    style={{
                      width: '100%',
                      padding: '13px 0',
                      borderRadius: 14,
                      background: colors.textPrimary,
                      color: colors.cardBg,
                      fontSize: 14,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Save Preferences
                  </motion.button>
                </div>
              )}

              {/* SHEET 6: NOTIFICATIONS */}
              {activeSheet === 'notifications' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Notification Preferences</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                    {[
                      { key: 'orderTracking', title: 'Order Tracking & 30-Min Dispatch', desc: 'Real-time updates on darkstore picker and runner movement' },
                      { key: 'doorstepTimer', title: '6-Minute Doorstep Fitting Timer', desc: 'Alerts when the runner arrives and trial window begins' },
                      { key: 'flashDrops', title: 'Brand Launches & Flash Drops', desc: 'Instant alerts on new catalog inwardings at Ahmedabad Hub' },
                      { key: 'whatsappUpdates', title: 'WhatsApp Order Updates', desc: 'Receive digital invoice and tracking link on WhatsApp' }
                    ].map(n => {
                      const enabled = (notifs as any)[n.key];
                      return (
                        <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1, paddingRight: 16 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{n.title}</div>
                            <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 1 }}>{n.desc}</div>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                              setNotifs(prev => ({ ...prev, [n.key]: !enabled }));
                              showToast(`${n.title} ${!enabled ? 'Enabled' : 'Disabled'}`);
                            }}
                            style={{
                              width: 48,
                              height: 28,
                              borderRadius: 14,
                              background: enabled ? '#10b981' : (isLight ? '#e5e5ea' : '#2c2c36'),
                              border: 'none',
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: enabled ? 'flex-end' : 'flex-start',
                              cursor: 'pointer',
                              outline: 'none',
                              flexShrink: 0
                            }}
                          >
                            <motion.div
                              layout
                              style={{ width: 24, height: 24, borderRadius: 12, background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                            />
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SHEET 7: GENERAL SETTINGS */}
              {activeSheet === 'generalSettings' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>General Settings</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Appearance Section: Light / Dark / Device settings */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      APPEARANCE (THEME)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleTheme('light')}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          background: theme === 'light' ? colors.textPrimary : colors.pillBg,
                          color: theme === 'light' ? colors.cardBg : colors.textPrimary,
                          border: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Sun size={18} />
                        <span>Light</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleTheme('dark')}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          background: theme === 'dark' ? colors.textPrimary : colors.pillBg,
                          color: theme === 'dark' ? colors.cardBg : colors.textPrimary,
                          border: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Moon size={18} />
                        <span>Dark</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleTheme('system')}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          background: theme === 'system' ? colors.textPrimary : colors.pillBg,
                          color: theme === 'system' ? colors.cardBg : colors.textPrimary,
                          border: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Laptop size={18} />
                        <span>Device</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Language */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: 8 }}>
                      LANGUAGE
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['English (IN)', 'Hindi', 'Gujarati'].map(lang => (
                        <motion.button
                          key={lang}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setGeneralSettings({ ...generalSettings, language: lang });
                            showToast(`Language set to ${lang}`);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: generalSettings.language === lang ? colors.textPrimary : colors.pillBg,
                            color: generalSettings.language === lang ? colors.cardBg : colors.textPrimary,
                            border: 'none',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {lang}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Location & Delivery Permissions */}
                  <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Precise Delivery Location</div>
                        <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                          Enables instant ETA calculation from Ahmedabad Darkstore Hub #01
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>Enabled ✓</span>
                    </div>
                  </div>

                  {/* Personalized Recommendations Toggle */}
                  <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Personalized Recommendations</div>
                        <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                          Curate home feed according to saved sizes & preferred styles
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          const val = !generalSettings.personalizedRecommendations;
                          setGeneralSettings({ ...generalSettings, personalizedRecommendations: val });
                          showToast(`Recommendations ${val ? 'Enabled' : 'Disabled'}`);
                        }}
                        style={{
                          width: 48,
                          height: 28,
                          borderRadius: 14,
                          background: generalSettings.personalizedRecommendations ? '#10b981' : (isLight ? '#e5e5ea' : '#2c2c36'),
                          border: 'none',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: generalSettings.personalizedRecommendations ? 'flex-end' : 'flex-start',
                          cursor: 'pointer',
                          outline: 'none',
                          flexShrink: 0
                        }}
                      >
                        <motion.div
                          layout
                          style={{ width: 24, height: 24, borderRadius: 12, background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* SHEET 8: HELP & SUPPORT */}
              {activeSheet === 'helpSupport' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Help & Customer Support</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Immediate Contact Channels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    <a
                      href="https://wa.me/919825088123"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '14px 16px',
                        borderRadius: 14,
                        background: '#25d366',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: 13.5,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <span>Chat with Drobe Concierge on WhatsApp</span>
                    </a>

                    <a
                      href="tel:+919825088123"
                      style={{
                        padding: '14px 16px',
                        borderRadius: 14,
                        background: isLight ? '#f2f2f7' : '#1e1e26',
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        fontSize: 13.5,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <span>Call Darkstore Hub Manager (+91 98250 88123)</span>
                    </a>
                  </div>

                  {/* FAQs Section */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 }}>
                      Frequently Asked Questions
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        {
                          q: 'How does 30-minute delivery work?',
                          a: 'DROBE maintains hyper-local darkstore hubs stocked with authentic streetwear. When you order, a runner is dispatched within 2 minutes for immediate doorstep arrival.'
                        },
                        {
                          q: 'What is the 6-minute doorstep trial window?',
                          a: 'Our runner waits at your door while you try on your items in private. Keep only the pieces and sizes you love, and return the rest on the spot.'
                        },
                        {
                          q: 'How do instant doorstep refunds work?',
                          a: 'When you hand back unkept items to the runner, they scan the tag barcode. Your refund is pushed immediately to your verified UPI VPA in real time.'
                        },
                        {
                          q: 'What if an item is damaged or missing?',
                          a: 'You can reject the piece directly during your 6-minute trial with zero questions asked, or tap our WhatsApp concierge for immediate doorstep replacement.'
                        }
                      ].map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                          <div
                            key={idx}
                            style={{
                              background: isLight ? '#f9f9fb' : '#121217',
                              border: `1px solid ${colors.border}`,
                              borderRadius: 12,
                              overflow: 'hidden'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'none',
                                border: 'none',
                                color: colors.textPrimary,
                                fontSize: 13,
                                fontWeight: 700,
                                textAlign: 'left',
                                cursor: 'pointer'
                              }}
                            >
                              <span>{faq.q}</span>
                              <ChevronDown
                                size={16}
                                color={colors.textSecondary}
                                style={{
                                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </button>
                            {isOpen && (
                              <div style={{ padding: '0 14px 12px', fontSize: 12, color: colors.textSecondary, lineHeight: 1.5 }}>
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SHEET 9: LOGIN & SECURITY */}
              {activeSheet === 'loginSecurity' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Login & Security</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>Passkey & Biometric Authentication</div>
                      <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 2 }}>Sign in using Apple FaceID or TouchID without passwords</div>
                    </div>

                    <div style={{ background: isLight ? '#f9f9fb' : '#121217', border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>Active Sessions</div>
                      <div style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 2 }}>iPhone 16 Pro • Ahmedabad, IN (Current Device)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SHEET 10: DELETE ACCOUNT */}
              {activeSheet === 'deleteAccount' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#ef4444' }}>Delete Account</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5, marginBottom: 16 }}>
                    Deleting your account will permanently remove your profile, saved sizes, and fashion preferences.
                    In accordance with statutory accounting and tax regulations, historical order fulfillment records must be retained for legal compliance.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSheet(null)}
                      style={{
                        flex: 1,
                        padding: '12px 0',
                        borderRadius: 12,
                        background: colors.pillBg,
                        color: colors.textPrimary,
                        fontSize: 13,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveSheet(null);
                        handleLogout();
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 0',
                        borderRadius: 12,
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm Delete
                    </motion.button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
