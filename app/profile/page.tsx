'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrialOrders, TrialOrder } from '@/app/lib/darkstoreData';
import {
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
  ChevronRight,
  Camera,
  Download,
  X,
  Smartphone,
  Moon,
  Sparkles,
  Wallet,
  UserCheck,
  Trash2,
  Check
} from 'lucide-react';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system-subheadline, "Helvetica Neue", Helvetica, Arial, sans-serif';

// Strictly Monochrome Black and White Palette (No Neon / Colors)
const UI = {
  bg: '#000000',
  card: '#121212',
  cardBorder: '1px solid #222222',
  cardHover: '#181818',
  divider: '#1c1c1c',
  accent: '#ffffff',
  accentText: '#000000',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#555555',
  pillBg: '#1c1c1c',
  pillBorder: '1px solid #2e2e2e',
  toggleOff: '#262626',
  toggleOn: '#ffffff',
  inputBg: '#161616',
  danger: '#ffffff'
};

type ActiveSheetType = 
  | 'orders'
  | 'addresses'
  | 'payments'
  | 'fashionPreferences'
  | 'helpSupport'
  | 'deleteAccount'
  | 'editProfile'
  | null;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser, wishlist, setIsAuthOpen } = useApp();

  // Active Bottom Sheet Modal
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

  // User Identity Data
  const [userData, setUserData] = useState({
    name: user?.name || (user ? 'Shopper' : 'Guest Shopper'),
    email: user?.email || (user?.phone ? `${user.phone.replace(/[^0-9]/g, '').slice(-10)}@drobe.in` : ''),
    phone: user?.phone || '',
    username: user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
    avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    hubZone: 'Ahmedabad Hub #01 (SG Highway)'
  });

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || 'Shopper',
        email: user.email || (user.phone ? `${user.phone.replace(/[^0-9]/g, '').slice(-10)}@drobe.in` : ''),
        phone: user.phone || '',
        username: user.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@shopper',
        avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        hubZone: 'Ahmedabad Hub #01 (SG Highway)'
      });
    } else {
      setUserData({
        name: 'Guest Shopper',
        email: '',
        phone: '',
        username: '@guest',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        hubZone: 'Ahmedabad Hub #01 (SG Highway)'
      });
    }
  }, [user]);

  // Toggles State
  const [toggles, setToggles] = useState({
    pushNotifications: true,
    smsAlerts: true,
    darkMode: true
  });

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState('English (IN)');

  // Saved Delivery Addresses (hydrated from localStorage)
  const [addresses, setAddresses] = useState<Array<{
    id: string;
    tag: string;
    recipient: string;
    line1: string;
    line2?: string;
    pincode: string;
    phone: string;
    isDefault?: boolean;
  }>>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('drobe_user_addresses');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setAddresses(parsed);
      }
    } catch {}
  }, []);

  // Saved Payments & UPI (hydrated from localStorage)
  const [upiId, setUpiId] = useState<string>('');
  const [savedCards, setSavedCards] = useState<Array<{
    id: string;
    bank: string;
    type: string;
    last4: string;
    expiry: string;
  }>>([]);

  useEffect(() => {
    try {
      const rawUpi = localStorage.getItem('drobe_user_upi');
      if (rawUpi) setUpiId(rawUpi);
      const rawCards = localStorage.getItem('drobe_user_cards');
      if (rawCards) {
        const parsed = JSON.parse(rawCards);
        if (Array.isArray(parsed)) setSavedCards(parsed);
      }
    } catch {}
  }, []);

  // Fashion Preferences
  const [fashionPrefs, setFashionPrefs] = useState({
    styles: ['Streetwear', 'Casual', 'Minimal', 'Oversized'],
    topSize: 'L',
    bottomSize: '32',
    footwearSize: 'UK 9',
    preferredFit: 'Relaxed',
    brands: ['SNITCH', 'The Souled Store', 'Tilt', 'Mark Leute']
  });

  // Orders Tab Filter inside orders sheet
  const [orderTab, setOrderTab] = useState<'all' | 'returns'>('all');

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Trial Orders (Only real orders for active user)
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>([]);

  useEffect(() => {
    try {
      const orders = getTrialOrders();
      if (Array.isArray(orders)) {
        if (user && user.phone) {
          const cleanPhone = user.phone.replace(/[^0-9]/g, '').slice(-10);
          const filtered = orders.filter(o => 
            (o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone)) ||
            (user.name && o.customerName?.toLowerCase() === user.name.toLowerCase())
          );
          setTrialOrders(filtered);
        } else {
          setTrialOrders([]);
        }
      }
    } catch {}
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    showToast('Logged out securely');
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  const handleDownloadData = () => {
    try {
      const exportData = {
        profile: userData,
        addresses,
        fashionPreferences: fashionPrefs,
        savedPayments: { upiId, tokenizedCards: savedCards.map(c => ({ bank: c.bank, last4: c.last4 })) },
        orders: trialOrders,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drobe_account_data_aman.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Account data exported');
    } catch {
      showToast('Account data export prepared');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: UI.bg,
        color: UI.textPrimary,
        fontFamily: FONT_FAMILY,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
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
              position: 'fixed',
              top: 20,
              left: 20,
              right: 20,
              zIndex: 100,
              background: '#ffffff',
              color: '#000000',
              borderRadius: 12,
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Edge-to-Edge List Content */}
      <main
        style={{
          width: '100%',
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 110px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: UI.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
            Profile
          </h1>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveSheet('editProfile')}
            style={{
              background: UI.pillBg,
              border: UI.cardBorder,
              borderRadius: 20,
              padding: '6px 14px',
              color: UI.textPrimary,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Edit
          </motion.button>
        </div>

        {/* User Hero Identity Card */}
        <div
          style={{
            background: UI.card,
            border: UI.cardBorder,
            borderRadius: 16,
            padding: '20px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          {/* Avatar with Monochrome Camera Badge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={userData.avatar}
              alt={userData.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#1a1a1a',
                border: '2px solid #333333'
              }}
            />
            <button
              type="button"
              onClick={() => setActiveSheet('editProfile')}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
              aria-label="Edit Profile Picture"
            >
              <Camera size={13} color="#000000" strokeWidth={2.5} />
            </button>
          </div>

          {/* User Information (Clean - No Taglines) */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: UI.textPrimary, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userData.name}
            </div>
            {userData.phone ? (
              <div style={{ fontSize: 13, color: UI.textSecondary, marginTop: 2 }}>
                {userData.phone}
              </div>
            ) : null}
            {userData.email ? (
              <div style={{ fontSize: 12, color: UI.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userData.email}
              </div>
            ) : null}

            {!user && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsAuthOpen(true)}
                style={{
                  marginTop: 8,
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Smartphone size={12} />
                <span>Sign In / Register</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* ====================================================================
            SECTION 1: ORDERS & ACTIVITY (PROPER VERTICAL LIST)
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: UI.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            Activity
          </div>

          <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 14, overflow: 'hidden' }}>
            {/* My Orders */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <Package size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  My Orders &amp; 30-Min Trials
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#ffffff', color: '#000000', padding: '2px 8px', borderRadius: 10 }}>
                  {trialOrders.length} {trialOrders.length === 1 ? 'Order' : 'Orders'}
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Wishlist */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => router.push('/cart')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Heart size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Wishlist &amp; Saved Fits
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: UI.textSecondary }}>
                  {wishlist.length} Saved
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Doorstep Fitting History */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => {
                setOrderTab('returns');
                setActiveSheet('orders');
              }}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <RotateCcw size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Doorstep Fitting Sessions &amp; Returns
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 2: FASHION & SIZING
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: UI.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            Fashion &amp; Sizing
          </div>

          <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 14, overflow: 'hidden' }}>
            {/* Size & Fit Profile */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <Shirt size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Size &amp; Fit Profile
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: UI.textSecondary }}>
                  {fashionPrefs.topSize} · {fashionPrefs.bottomSize} · {fashionPrefs.footwearSize}
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Style & Brand Preferences */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <Sparkles size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Style &amp; Brand Preferences
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: UI.textSecondary }}>
                  {fashionPrefs.preferredFit}
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 3: DELIVERY & PAYMENTS
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: UI.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            Delivery &amp; Payments
          </div>

          <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 14, overflow: 'hidden' }}>
            {/* Saved Delivery Addresses */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <MapPin size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Saved Delivery Addresses
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: UI.textSecondary }}>
                  {addresses.length} Saved
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Payment Methods */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <CreditCard size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Payment Methods &amp; Cards
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Instant Doorstep UPI VPA */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <Wallet size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Instant Doorstep Refund VPA
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: UI.textSecondary }}>
                  {upiId}
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 4: PREFERENCES & SETTINGS (INLINE LIST - NO SEPARATE SCREEN)
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: UI.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            Preferences
          </div>

          <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 14, overflow: 'hidden' }}>
            {/* Push Notifications Toggle */}
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Bell size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Push Notifications
                </span>
              </div>

              {/* Black & White iOS Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !toggles.pushNotifications;
                  setToggles({ ...toggles, pushNotifications: next });
                  showToast(`Notifications ${next ? 'Enabled' : 'Disabled'}`);
                }}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  background: toggles.pushNotifications ? '#ffffff' : '#262626',
                  border: 'none',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: toggles.pushNotifications ? 'flex-end' : 'flex-start',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: toggles.pushNotifications ? '#000000' : '#888888',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>
            </div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* SMS & WhatsApp Alerts */}
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Smartphone size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  SMS &amp; WhatsApp Alerts
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !toggles.smsAlerts;
                  setToggles({ ...toggles, smsAlerts: next });
                  showToast(`Delivery partner alerts ${next ? 'Enabled' : 'Disabled'}`);
                }}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  background: toggles.smsAlerts ? '#ffffff' : '#262626',
                  border: 'none',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: toggles.smsAlerts ? 'flex-end' : 'flex-start',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: toggles.smsAlerts ? '#000000' : '#888888',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>
            </div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Dark Mode */}
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Moon size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Dark Mode
                </span>
              </div>

              <div
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  background: '#ffffff',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: '#000000'
                  }}
                />
              </div>
            </div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Language */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => {
                const langs = ['English (IN)', 'Hindi', 'Gujarati'];
                const next = langs[(langs.indexOf(selectedLanguage) + 1) % langs.length];
                setSelectedLanguage(next);
                showToast(`Language set to ${next}`);
              }}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sliders size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Language
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: UI.textSecondary }}>
                  {selectedLanguage}
                </span>
                <ChevronRight size={16} color={UI.textMuted} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 5: ACCOUNT & SECURITY
            ==================================================================== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: UI.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            Account &amp; Security
          </div>

          <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 14, overflow: 'hidden' }}>
            {/* Edit Profile */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => setActiveSheet('editProfile')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserCheck size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Edit Profile Details
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Download My Data */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <Download size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Download My Data
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Security */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => showToast('Security: 256-bit AES encryption & tokenized payments active')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Security &amp; Tokenization
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 6: SUPPORT & LEGAL
            ==================================================================== */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: UI.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            Support &amp; Legal
          </div>

          <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 14, overflow: 'hidden' }}>
            {/* Help & Support */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
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
                <HelpCircle size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Help &amp; Concierge Support
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Terms of Service */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => showToast('Terms: Authentic designer drops with 30-min trial guarantee.')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Terms of Service
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>

            <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

            {/* Privacy Policy */}
            <motion.div
              whileTap={{ scale: 0.99, backgroundColor: UI.cardHover }}
              onClick={() => showToast('Privacy Policy: All customer data is tokenized and never sold.')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Lock size={18} color="#ffffff" />
                <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                  Privacy Policy
                </span>
              </div>
              <ChevronRight size={16} color={UI.textMuted} />
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            SECTION 7: ACTIONS (CLEAN MONOCHROME LOGOUT & DELETE)
            ==================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {/* Solid White Button with Black Text */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 14,
              background: '#ffffff',
              color: '#000000',
              fontSize: 14.5,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.01em'
            }}
          >
            Log Out
          </motion.button>

          {/* Delete Account */}
          <button
            type="button"
            onClick={() => setActiveSheet('deleteAccount')}
            style={{
              background: 'none',
              border: 'none',
              color: UI.textMuted,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 0',
              textAlign: 'center'
            }}
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* ====================================================================
          BOTTOM SHEETS (ALL RE-STYLED IN PURE BLACK & WHITE)
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
              background: 'rgba(0, 0, 0, 0.85)',
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
                background: '#121212',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderTop: '1px solid #222222',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: UI.textPrimary,
                fontFamily: FONT_FAMILY
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Drag Handle */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  background: '#333333',
                  borderRadius: 2,
                  margin: '10px auto 14px'
                }}
              />

              {/* SHEET 1: MY ORDERS & 30-MIN TRACKING */}
              {activeSheet === 'orders' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>My Orders &amp; 30-Min Tracking</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {[
                      { key: 'all', label: 'All Orders' },
                      { key: 'returns', label: 'Doorstep Returns' }
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setOrderTab(t.key as any)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          background: orderTab === t.key ? '#ffffff' : '#1c1c1c',
                          color: orderTab === t.key ? '#000000' : '#ffffff',
                          fontSize: 12,
                          fontWeight: 700,
                          border: orderTab === t.key ? 'none' : '1px solid #2a2a2a',
                          cursor: 'pointer'
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {orderTab === 'all' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {trialOrders.length === 0 ? (
                        <div style={{
                          background: '#141414',
                          border: '1px dashed #282828',
                          borderRadius: 14,
                          padding: '32px 20px',
                          textAlign: 'center'
                        }}>
                          <Package size={36} color="#666666" style={{ margin: '0 auto 12px' }} />
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                            No Orders Yet
                          </div>
                          <p style={{ fontSize: 12.5, color: UI.textSecondary, margin: '0 0 16px', lineHeight: 1.5 }}>
                            You have not placed any orders yet. Discover fresh drop releases and try items at your doorstep in 30 minutes!
                          </p>
                          <button
                            onClick={() => {
                              setActiveSheet(null);
                              router.push('/');
                            }}
                            style={{
                              padding: '10px 20px',
                              borderRadius: 10,
                              background: '#ffffff',
                              color: '#000000',
                              fontSize: 12.5,
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Explore Catalog
                          </button>
                        </div>
                      ) : (
                        trialOrders.map(o => (
                          <div key={o.id} style={{ background: '#181818', border: '1px solid #262626', borderRadius: 14, padding: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>{o.orderNumber || o.id}</span>
                              <span style={{ fontSize: 11, color: UI.textMuted }}>{o.dispatchedAt || 'Today'}</span>
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.status}</div>
                            <div style={{ fontSize: 12, color: UI.textSecondary, margin: '2px 0 10px 0' }}>
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
                                background: '#ffffff',
                                color: '#000000',
                                fontSize: 12.5,
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Live 30-Min GPS Tracking
                            </motion.button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {orderTab === 'returns' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {trialOrders.filter(o => (o.status || '').toLowerCase().includes('return')).length === 0 ? (
                        <div style={{
                          background: '#141414',
                          border: '1px dashed #282828',
                          borderRadius: 14,
                          padding: '32px 20px',
                          textAlign: 'center'
                        }}>
                          <RotateCcw size={36} color="#666666" style={{ margin: '0 auto 12px' }} />
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                            No Doorstep Returns
                          </div>
                          <p style={{ fontSize: 12.5, color: UI.textSecondary, margin: 0, lineHeight: 1.5 }}>
                            Items handed back to the delivery partner during the 6-minute fitting trial will appear here with instant UPI refund status.
                          </p>
                        </div>
                      ) : (
                        trialOrders.filter(o => (o.status || '').toLowerCase().includes('return')).map(o => (
                          <div key={o.id} style={{ background: '#181818', border: '1px solid #262626', borderRadius: 14, padding: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>
                              ✓ Instant Doorstep Refund Settled
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
                              Order {o.orderNumber || o.id} ({o.productName})
                            </div>
                            <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 2 }}>
                              Returned during 6-min fitting. {o.price} credited instantly via UPI to {upiId}.
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SHEET 2: PAYMENTS & REFUNDS */}
              {activeSheet === 'payments' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Payments &amp; UPI</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ background: '#181818', border: '1px solid #262626', borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: UI.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                      Instant Doorstep Refund VPA
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{upiId || 'No UPI ID linked'}</div>
                    <p style={{ fontSize: 12, color: UI.textSecondary, margin: '4px 0 10px 0' }}>
                      Refunds are credited instantly to this UPI address when items are returned during the 6-min fitting trial.
                    </p>
                    {upiId ? (
                      <button
                        onClick={() => showToast('UPI VPA verified and active')}
                        style={{ padding: '6px 14px', borderRadius: 8, background: '#ffffff', border: 'none', color: '#000000', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Verified Active
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveSheet('editProfile');
                          showToast('Enter your UPI ID below');
                        }}
                        style={{ padding: '6px 14px', borderRadius: 8, background: '#262626', border: 'none', color: '#ffffff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add UPI VPA
                      </button>
                    )}
                  </div>

                  <div style={{ background: '#181818', border: '1px solid #262626', borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: UI.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                      Saved Cards
                    </div>
                    {savedCards.length === 0 ? (
                      <div style={{ fontSize: 12.5, color: UI.textSecondary, padding: '8px 0' }}>
                        No saved cards yet. Cards added during checkout will appear here for 1-tap secure tokenized payment.
                      </div>
                    ) : (
                      savedCards.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.bank} {c.type} •••• {c.last4}</div>
                            <div style={{ fontSize: 11, color: UI.textSecondary }}>Expires {c.expiry}</div>
                          </div>
                          <span style={{ fontSize: 11, color: '#ffffff', fontWeight: 700 }}>Tokenized ✓</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SHEET 3: FASHION PREFERENCES */}
              {activeSheet === 'fashionPreferences' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Fashion &amp; Sizing Profile</h3>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Top Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      TOP SIZE
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                        <button
                          key={sz}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, topSize: sz }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.topSize === sz ? '#ffffff' : '#181818',
                            color: fashionPrefs.topSize === sz ? '#000000' : '#ffffff',
                            fontSize: 13,
                            fontWeight: 800,
                            border: fashionPrefs.topSize === sz ? 'none' : '1px solid #262626',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      BOTTOM SIZE
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['28', '30', '32', '34', '36'].map(sz => (
                        <button
                          key={sz}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, bottomSize: sz }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.bottomSize === sz ? '#ffffff' : '#181818',
                            color: fashionPrefs.bottomSize === sz ? '#000000' : '#ffffff',
                            fontSize: 13,
                            fontWeight: 800,
                            border: fashionPrefs.bottomSize === sz ? 'none' : '1px solid #262626',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footwear Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      FOOTWEAR SIZE
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'].map(sz => (
                        <button
                          key={sz}
                          onClick={() => setFashionPrefs(prev => ({ ...prev, footwearSize: sz }))}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            background: fashionPrefs.footwearSize === sz ? '#ffffff' : '#181818',
                            color: fashionPrefs.footwearSize === sz ? '#000000' : '#ffffff',
                            fontSize: 12,
                            fontWeight: 800,
                            border: fashionPrefs.footwearSize === sz ? 'none' : '1px solid #262626',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Styles */}
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      PREFERRED STYLES
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Streetwear', 'Casual', 'Minimal', 'Oversized', 'Formal', 'Athleisure'].map(st => {
                        const isSelected = fashionPrefs.styles.includes(st);
                        return (
                          <button
                            key={st}
                            onClick={() => {
                              setFashionPrefs(prev => ({
                                ...prev,
                                styles: isSelected ? prev.styles.filter(s => s !== st) : [...prev.styles, st]
                              }));
                            }}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 20,
                              background: isSelected ? '#ffffff' : '#181818',
                              color: isSelected ? '#000000' : '#ffffff',
                              fontSize: 12,
                              fontWeight: isSelected ? 800 : 600,
                              border: isSelected ? 'none' : '1px solid #262626',
                              cursor: 'pointer'
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '}{st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveSheet(null);
                      showToast('Fashion preferences updated');
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      borderRadius: 14,
                      background: '#ffffff',
                      color: '#000000',
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

              {/* SHEET 4: SAVED ADDRESSES */}
              {activeSheet === 'addresses' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Saved Addresses</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                    {addresses.length === 0 ? (
                      <div style={{
                        background: '#141414',
                        border: '1px dashed #282828',
                        borderRadius: 14,
                        padding: '28px 16px',
                        textAlign: 'center'
                      }}>
                        <MapPin size={32} color="#666666" style={{ margin: '0 auto 10px' }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                          No Saved Addresses
                        </div>
                        <p style={{ fontSize: 12, color: UI.textSecondary, margin: 0 }}>
                          Save your delivery address for 30-minute doorstep drops and 6-minute fitting trials.
                        </p>
                      </div>
                    ) : (
                      addresses.map(addr => (
                        <div key={addr.id} style={{ background: '#181818', border: addr.isDefault ? '1.5px solid #ffffff' : '1px solid #262626', borderRadius: 14, padding: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, background: '#262626', color: '#ffffff', padding: '2px 8px', borderRadius: 6 }}>
                              {addr.tag}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>Default ✓</span>
                            )}
                          </div>
                          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{addr.recipient}</div>
                          <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 2 }}>{addr.line1}, {addr.line2} - {addr.pincode}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveSheet('editProfile');
                      showToast('Update address in profile details');
                    }}
                    style={{
                      width: '100%',
                      padding: '13px 0',
                      borderRadius: 14,
                      background: '#ffffff',
                      color: '#000000',
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

              {/* SHEET 5: HELP & SUPPORT */}
              {activeSheet === 'helpSupport' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Help &amp; Support</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <a
                      href="https://wa.me/919825088123"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: '#ffffff',
                        color: '#000000',
                        textDecoration: 'none',
                        fontSize: 13.5,
                        fontWeight: 800,
                        textAlign: 'center'
                      }}
                    >
                      WhatsApp Support (+91 98250 88123)
                    </a>

                    <a
                      href="tel:+919825088123"
                      style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: '#181818',
                        border: '1px solid #262626',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: 13.5,
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      Call Ahmedabad Darkstore Hub
                    </a>
                  </div>

                  {/* FAQs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { q: 'How does 30-minute delivery work?', a: 'Dispatched directly from Ahmedabad Central Darkstore to your door via express delivery partners.' },
                      { q: 'What is the 6-minute doorstep trial?', a: 'The delivery partner waits 6 minutes while you try on your fits. Keep what fits and return what does not.' },
                      { q: 'How do instant doorstep refunds work?', a: 'Returned items are scanned on the spot, triggering immediate UPI credit to your verified VPA.' }
                    ].map((f, i) => (
                      <div key={i} style={{ background: '#181818', border: '1px solid #262626', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{f.q}</div>
                        <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 4 }}>{f.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SHEET 6: EDIT PROFILE (INLINE SHEET) */}
              {activeSheet === 'editProfile' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Edit Profile Details</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#181818', border: '1px solid #262626', borderRadius: 12, padding: '12px 14px' }}>
                      <label style={{ fontSize: 11, color: UI.textSecondary, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ background: '#181818', border: '1px solid #262626', borderRadius: 12, padding: '12px 14px' }}>
                      <label style={{ fontSize: 11, color: UI.textSecondary, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ background: '#181818', border: '1px solid #262626', borderRadius: 12, padding: '12px 14px' }}>
                      <label style={{ fontSize: 11, color: UI.textSecondary, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveSheet(null);
                      showToast('Profile updated successfully');
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      borderRadius: 14,
                      background: '#ffffff',
                      color: '#000000',
                      fontSize: 14,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              )}

              {/* SHEET 7: DELETE ACCOUNT */}
              {activeSheet === 'deleteAccount' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#ffffff' }}>Delete Account</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p style={{ fontSize: 13, color: UI.textSecondary, lineHeight: 1.5, marginBottom: 18 }}>
                    Deleting your account will permanently wipe your profile, saved measurements, and fashion preferences.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      style={{
                        flex: 1,
                        padding: '13px 0',
                        borderRadius: 14,
                        background: '#181818',
                        border: '1px solid #262626',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        handleLogout();
                      }}
                      style={{
                        flex: 1,
                        padding: '13px 0',
                        borderRadius: 14,
                        background: '#ffffff',
                        color: '#000000',
                        fontSize: 13,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
