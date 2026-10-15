'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrialOrders, TrialOrder } from '@/app/lib/darkstoreData';
import {
  Settings,
  ArrowLeft,
  Check,
  CheckCircle2,
  Camera,
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
  ChevronDown,
  Plus,
  Trash2,
  Download,
  X,
  Smartphone,
  Sun,
  Moon,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';

// Apple System Font Stack
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system-subheadline, "Helvetica Neue", Helvetica, Arial, sans-serif';

// UI Palette Matching Reference Images (Ultra-Sleek Dark + Neon Lime Accent)
const UI = {
  bg: '#0a0a0f',
  card: '#16161f',
  cardBorder: '1px solid rgba(255, 255, 255, 0.06)',
  cardHover: '#1c1c28',
  divider: 'rgba(255, 255, 255, 0.07)',
  accent: '#d4f938',       // Signature Neon-Lime from user screenshot
  accentText: '#000000',
  textPrimary: '#ffffff',
  textSecondary: '#8e8e98',
  textMuted: '#5d5d68',
  pillBg: '#1a1a24',
  pillBorder: '1px solid rgba(255, 255, 255, 0.08)',
  toggleOff: '#272733',
  inputBg: '#12121a',
  danger: '#ef4444'
};

type ViewMode = 'main' | 'settings' | 'editProfile';

type ActiveSheetType = 
  | 'orders'
  | 'addresses'
  | 'payments'
  | 'fashionPreferences'
  | 'helpSupport'
  | 'deleteAccount'
  | null;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser, wishlist, orders: contextOrders } = useApp();

  // Navigation View State: 'main' (Image 1 Left), 'settings' (Image 1 Right), 'editProfile' (Image 2)
  const [viewMode, setViewMode] = useState<ViewMode>('main');

  // Active Bottom Sheet Modal for deep details
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

  // Profile Overview Tabs (Matching the horizontal pill switch in Image 1 Left)
  const [activeProfileTab, setActiveProfileTab] = useState<'orders' | 'wishlist' | 'preferences' | 'addresses'>('orders');

  // User Identity Data
  const [userData, setUserData] = useState({
    name: user?.name || 'Aman Mishra',
    email: 'aman@example.com',
    phone: user?.phone || '+91 98250 88123',
    username: '@amanmishra',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    hubZone: 'Ahmedabad Hub #01 (SG Highway)',
    followersCount: '15.2k',
    followingCount: '142'
  });

  // Toggles State (Matching Switches in Image 1 Right)
  const [toggles, setToggles] = useState({
    pushNotifications: true,
    doorstepTimerAlerts: true,
    darkMode: true,
    personalizedRecommendations: true,
    locationPermission: true,
    whatsappUpdates: true
  });

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState('English (IN)');

  // Saved Delivery Addresses
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

  // Saved Payments & Tokenized Cards
  const [upiId, setUpiId] = useState('aman@okhdfcbank');
  const [savedCards] = useState([
    { id: 'card-1', bank: 'HDFC Bank', type: 'Visa', last4: '4028', expiry: '08/29' },
    { id: 'card-2', bank: 'ICICI Bank', type: 'Mastercard', last4: '9102', expiry: '11/28' }
  ]);

  // Fashion Preferences (Drobe Special Feature)
  const [fashionPrefs, setFashionPrefs] = useState({
    styles: ['Streetwear', 'Casual', 'Minimal', 'Oversized'],
    topSize: 'L',
    bottomSize: '32',
    footwearSize: 'UK 9',
    preferredFit: 'Relaxed',
    brands: ['SNITCH', 'The Souled Store', 'Tilt', 'Mark Leute']
  });

  // Orders Tab Filter
  const [orderTab, setOrderTab] = useState<'all' | 'live' | 'returns' | 'coupons'>('all');

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
    } catch {}
  }, []);

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
        background: UI.bg,
        color: UI.textPrimary,
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
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
              position: 'absolute',
              top: 16,
              left: 20,
              right: 20,
              zIndex: 100,
              background: UI.card,
              color: UI.accent,
              border: `1px solid ${UI.accent}`,
              borderRadius: 14,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content Area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 90px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* ====================================================================
            VIEW 1: MY PROFILE (Exact UI from Image 1 Left Screen)
            ==================================================================== */}
        {viewMode === 'main' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
          >
            {/* Top Navigation Bar: Title + Right Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                paddingTop: 4
              }}
            >
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: UI.textPrimary,
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}
              >
                My profile
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Notification Badge / Live Orders Counter */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveSheet('orders')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: UI.pillBg,
                    border: UI.cardBorder,
                    borderRadius: 20,
                    padding: '6px 12px',
                    color: UI.textPrimary,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Package size={14} color={UI.accent} />
                  <span>{trialOrders.length || 1}</span>
                </motion.button>

                {/* Settings Icon Button (Navigates to Settings Screen matching Image 1 Right) */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode('settings')}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    background: UI.pillBg,
                    border: UI.cardBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: UI.textPrimary,
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={18} />
                </motion.button>
              </div>
            </div>

            {/* Profile Hero: Centered Circular Avatar + Verified Checkmark */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#38bdf8', // Vibrant turquoise backing matching image
                    border: '3px solid #1f1f2b'
                  }}
                />
                {/* Camera / Edit Badge */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode('editProfile')}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: UI.accent,
                    border: '2px solid #0a0a0f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} color="#000000" strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Name & Green Verified Check Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: UI.textPrimary, letterSpacing: '-0.01em' }}>
                  {userData.name}
                </h2>
                <div
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    background: UI.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Check size={11} color="#000000" strokeWidth={3} />
                </div>
              </div>

              {/* Hub & Email Subtext */}
              <p style={{ fontSize: 13, color: UI.textSecondary, margin: '5px 0 0 0' }}>
                {userData.email} • {userData.hubZone}
              </p>

              {/* Stats Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: UI.textMuted }}>
                  <strong style={{ color: UI.textPrimary }}>30-Min</strong> Express Trial Tier
                </span>
                <span style={{ color: UI.textMuted }}>•</span>
                <span style={{ fontSize: 12, color: UI.textMuted }}>
                  <strong style={{ color: UI.textPrimary }}>{wishlist.length}</strong> Saved Drops
                </span>
              </div>
            </div>

            {/* Horizontal Filter Switcher (Matching Image 1 Pill Switcher with Neon-Lime Active State) */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 18,
                overflowX: 'auto',
                paddingBottom: 4
              }}
            >
              {[
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'preferences', label: 'Fashion Prefs', icon: Shirt },
                { id: 'addresses', label: 'Addresses', icon: MapPin }
              ].map(tab => {
                const isActive = activeProfileTab === tab.id;
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setActiveProfileTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 22,
                      background: isActive ? UI.accent : UI.pillBg,
                      color: isActive ? UI.accentText : UI.textSecondary,
                      border: isActive ? 'none' : UI.pillBorder,
                      fontSize: 12.5,
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Icon size={14} color={isActive ? '#000000' : UI.textSecondary} />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Tab 1 Content: Active / Recent Orders Card */}
            {activeProfileTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {trialOrders.length > 0 ? (
                  trialOrders.slice(0, 2).map((order) => (
                    <motion.div
                      key={order.id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => router.push(`/order/${order.id}`)}
                      style={{
                        background: UI.card,
                        border: UI.cardBorder,
                        borderRadius: 18,
                        padding: 16,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, background: UI.accent, color: '#000', padding: '2px 8px', borderRadius: 6 }}>
                            LIVE 30-MIN
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: UI.textPrimary }}>
                            {order.orderNumber || order.id}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: UI.textMuted }}>
                          {order.dispatchedAt || 'Today'}
                        </span>
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary, marginBottom: 4 }}>
                        {order.status}
                      </div>

                      <div style={{ fontSize: 12.5, color: UI.textSecondary, marginBottom: 12 }}>
                        {order.brandName} • {order.productName} ({order.size}) • {order.price}
                      </div>

                      <div
                        style={{
                          background: '#121219',
                          borderRadius: 12,
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: UI.accent }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: UI.textPrimary }}>
                            Runner {order.riderName} En Route
                          </span>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: UI.accent }}>
                          Open Live Map →
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 18, padding: '30px 16px', textAlign: 'center' }}>
                    <Package size={36} color={UI.textMuted} style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: 14, fontWeight: 700 }}>No active orders</div>
                    <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 4 }}>
                      Your 30-min express trial fits will appear here.
                    </div>
                  </div>
                )}

                {/* View Full Order Details Sheet Trigger */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSheet('orders')}
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    borderRadius: 14,
                    background: UI.pillBg,
                    border: UI.cardBorder,
                    color: UI.textPrimary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View Returns, Invoices & Past Orders
                </motion.button>
              </div>
            )}

            {/* Tab 2 Content: Wishlist Preview */}
            {activeProfileTab === 'wishlist' && (
              <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 18, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Saved Wardrobe Drops</div>
                  <span style={{ fontSize: 12, color: UI.textSecondary }}>{wishlist.length} items</span>
                </div>
                <p style={{ fontSize: 12.5, color: UI.textSecondary, lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Pieces saved for express 30-minute doorstep trial. Stock is reserved locally in Ahmedabad Darkstore Hub #01.
                </p>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/trends')}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 12,
                    background: UI.accent,
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Browse Saved Trends & Drops
                </motion.button>
              </div>
            )}

            {/* Tab 3 Content: Fashion Preferences Preview */}
            {activeProfileTab === 'preferences' && (
              <div style={{ background: UI.card, border: UI.cardBorder, borderRadius: 18, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>My Fashion Sizes & Styles</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#000', background: UI.accent, padding: '2px 8px', borderRadius: 6 }}>
                    Top: {fashionPrefs.topSize} • Bottom: {fashionPrefs.bottomSize}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {fashionPrefs.styles.map(s => (
                    <span key={s} style={{ fontSize: 11.5, fontWeight: 600, background: UI.pillBg, padding: '5px 10px', borderRadius: 12, border: UI.cardBorder }}>
                      {s}
                    </span>
                  ))}
                  {fashionPrefs.brands.map(b => (
                    <span key={b} style={{ fontSize: 11.5, fontWeight: 700, color: UI.accent, background: UI.pillBg, padding: '5px 10px', borderRadius: 12, border: UI.cardBorder }}>
                      ★ {b}
                    </span>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSheet('fashionPreferences')}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 12,
                    background: UI.pillBg,
                    border: UI.cardBorder,
                    color: UI.textPrimary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Edit Fashion & Brand Preferences
                </motion.button>
              </div>
            )}

            {/* Tab 4 Content: Saved Addresses Preview */}
            {activeProfileTab === 'addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ background: UI.card, border: addr.isDefault ? `1.5px solid ${UI.accent}` : UI.cardBorder, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, background: UI.pillBg, padding: '2px 8px', borderRadius: 6 }}>
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: UI.accent }}>Default Express Address ✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{addr.recipient}</div>
                    <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 2 }}>{addr.line1}, {addr.line2}</div>
                  </div>
                ))}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSheet('addresses')}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 12,
                    background: UI.pillBg,
                    border: UI.cardBorder,
                    color: UI.textPrimary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Manage Delivery Addresses
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* ====================================================================
            VIEW 2: SETTINGS SCREEN (Exact UI from Image 1 Right Screen)
            ==================================================================== */}
        {viewMode === 'settings' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
          >
            {/* Top Navigation Bar: Back Arrow + Center Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                paddingTop: 4
              }}
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMode('main')}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  background: UI.pillBg,
                  border: UI.cardBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: UI.textPrimary,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={18} />
              </motion.button>

              <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: UI.textPrimary }}>
                Settings
              </h1>

              <div style={{ width: 38 }} />
            </div>

            {/* Profile Row Card at Top of Settings (Navigates to Edit Profile Screen in Image 2) */}
            <motion.div
              whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
              onClick={() => setViewMode('editProfile')}
              style={{
                background: UI.card,
                border: UI.cardBorder,
                borderRadius: 18,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#38bdf8'
                  }}
                />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: UI.textPrimary }}>
                    {userData.name}
                  </div>
                  <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 1 }}>
                    {userData.email}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={UI.textMuted} />
            </motion.div>

            {/* Grouped Card 1: Notifications & Alert Preferences */}
            <div
              style={{
                background: UI.card,
                border: UI.cardBorder,
                borderRadius: 18,
                overflow: 'hidden',
                marginBottom: 14
              }}
            >
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
                  <Bell size={18} color={UI.textSecondary} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                      Push notifications
                    </div>
                    <div style={{ fontSize: 11, color: UI.textSecondary, marginTop: 1 }}>
                      30-min delivery & live runner dispatch alerts
                    </div>
                  </div>
                </div>

                {/* iOS-Style Toggle Switch (Neon-Lime when ON as shown in Image 1 Right) */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const next = !toggles.pushNotifications;
                    setToggles({ ...toggles, pushNotifications: next });
                    showToast(`Notifications ${next ? 'Enabled' : 'Disabled'}`);
                  }}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    background: toggles.pushNotifications ? UI.accent : UI.toggleOff,
                    border: 'none',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: toggles.pushNotifications ? 'flex-end' : 'flex-start',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <motion.div
                    layout
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  />
                </motion.button>
              </div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Doorstep 6-Min Timer Alerts Row */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
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
                  <Shirt size={18} color={UI.textSecondary} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                      Fashion & fit settings
                    </div>
                    <div style={{ fontSize: 11, color: UI.textSecondary, marginTop: 1 }}>
                      Saved sizes, preferred fits & favourite brands
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>
            </div>

            {/* Grouped Card 2: Appearance, Language, App Permissions */}
            <div
              style={{
                background: UI.card,
                border: UI.cardBorder,
                borderRadius: 18,
                overflow: 'hidden',
                marginBottom: 14
              }}
            >
              {/* Dark Mode Toggle (Off/White toggle as shown in Image 1 Right) */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Moon size={18} color={UI.textSecondary} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                      Dark mode
                    </div>
                    <div style={{ fontSize: 11, color: UI.textSecondary, marginTop: 1 }}>
                      Ultra-sleek dark aesthetic
                    </div>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const next = !toggles.darkMode;
                    setToggles({ ...toggles, darkMode: next });
                    showToast(`Visual Mode: ${next ? 'Dark Mode' : 'Light Mode'}`);
                  }}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    background: toggles.darkMode ? UI.accent : UI.toggleOff,
                    border: 'none',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: toggles.darkMode ? 'flex-end' : 'flex-start',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <motion.div
                    layout
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  />
                </motion.button>
              </div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Language Selection */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
                onClick={() => {
                  const langs = ['English (IN)', 'Hindi', 'Gujarati'];
                  const currIdx = langs.indexOf(selectedLanguage);
                  const nextLang = langs[(currIdx + 1) % langs.length];
                  setSelectedLanguage(nextLang);
                  showToast(`Language set to ${nextLang}`);
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
                  <Sliders size={18} color={UI.textSecondary} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                      Language
                    </div>
                    <div style={{ fontSize: 11, color: UI.textSecondary, marginTop: 1 }}>
                      {selectedLanguage}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Saved Delivery Addresses */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
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
                  <MapPin size={18} color={UI.textSecondary} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                      Saved addresses
                    </div>
                    <div style={{ fontSize: 11, color: UI.textSecondary, marginTop: 1 }}>
                      Home, Work & default delivery locations
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Payments & Refunds */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
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
                  <CreditCard size={18} color={UI.textSecondary} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                      Payments & refunds
                    </div>
                    <div style={{ fontSize: 11, color: UI.textSecondary, marginTop: 1 }}>
                      Instant doorstep UPI VPA & tokenized cards
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>
            </div>

            {/* Grouped Card 3: Help, Terms, Privacy Policy & Data */}
            <div
              style={{
                background: UI.card,
                border: UI.cardBorder,
                borderRadius: 18,
                overflow: 'hidden',
                marginBottom: 20
              }}
            >
              {/* Help & Support */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
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
                  <HelpCircle size={18} color={UI.textSecondary} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                    Help
                  </span>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Terms of Service */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
                onClick={() => showToast('Terms of Service: Authentic designer drops & 30-min trial guarantee.')}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={18} color={UI.textSecondary} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                    Terms of service
                  </span>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Privacy Policy */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
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
                  <ShieldCheck size={18} color={UI.textSecondary} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                    Privacy policy
                  </span>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Download My Data */}
              <motion.div
                whileTap={{ scale: 0.985, backgroundColor: UI.cardHover }}
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
                  <Download size={18} color={UI.textSecondary} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: UI.textPrimary }}>
                    Download my data
                  </span>
                </div>
                <ChevronRight size={18} color={UI.textMuted} />
              </motion.div>
            </div>

            {/* Bottom Log Out Pill Button (Matching Image 1 Right Pill Button with White Background) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 24,
                background: '#ffffff',
                color: '#111115',
                fontSize: 14.5,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 14,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
              }}
            >
              Log Out
            </motion.button>
          </motion.div>
        )}

        {/* ====================================================================
            VIEW 3: EDIT PROFILE SCREEN (Exact UI from Image 2 Screen)
            ==================================================================== */}
        {viewMode === 'editProfile' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {/* Top Navigation Bar: Circular Back Arrow + Center Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 26,
                paddingTop: 4
              }}
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewMode('settings')}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  background: UI.pillBg,
                  border: UI.cardBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: UI.textPrimary,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={18} />
              </motion.button>

              <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: UI.textPrimary }}>
                Edit Profile
              </h1>

              <div style={{ width: 38 }} />
            </div>

            {/* Avatar Section: Centered Circle with Turquoise Backing & Neon-Lime Camera Icon */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#38bdf8', // Vibrant turquoise
                    border: '3px solid #1f1f2b'
                  }}
                />
                {/* Neon-Lime Circular Camera Edit Badge (Exact match to Image 2) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    background: UI.accent,
                    border: '2.5px solid #0a0a0f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} color="#000000" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Form Fields Card (Exact UI Layout from Image 2) */}
            <div
              style={{
                background: UI.card,
                border: UI.cardBorder,
                borderRadius: 18,
                overflow: 'hidden',
                marginBottom: 20
              }}
            >
              {/* Row 1: Full name */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <label style={{ fontSize: 13, color: UI.textSecondary, fontWeight: 600 }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: UI.textPrimary,
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'right',
                    outline: 'none',
                    fontFamily: FONT_FAMILY
                  }}
                />
              </div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Row 2: Phone number */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <label style={{ fontSize: 13, color: UI.textSecondary, fontWeight: 600 }}>
                  Phone number
                </label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: UI.textPrimary,
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'right',
                    outline: 'none',
                    fontFamily: FONT_FAMILY
                  }}
                />
              </div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Row 3: Email */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <label style={{ fontSize: 13, color: UI.textSecondary, fontWeight: 600 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: UI.textPrimary,
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'right',
                    outline: 'none',
                    fontFamily: FONT_FAMILY
                  }}
                />
              </div>

              <div style={{ height: 1, background: UI.divider, margin: '0 16px' }} />

              {/* Row 4: Username / Hub Zone */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <label style={{ fontSize: 13, color: UI.textSecondary, fontWeight: 600 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: UI.textPrimary,
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'right',
                    outline: 'none',
                    fontFamily: FONT_FAMILY
                  }}
                />
              </div>
            </div>

            {/* Primary Action Button: Neon-Lime Pill "Save Changes" (Exact match to Image 2) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setViewMode('main');
                showToast('Profile changes saved successfully! ✨');
              }}
              style={{
                width: '100%',
                padding: '15px 0',
                borderRadius: 25,
                background: UI.accent,
                color: '#000000',
                fontSize: 14.5,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 12,
                boxShadow: '0 6px 20px rgba(212, 249, 56, 0.25)'
              }}
            >
              Save Changes
            </motion.button>

            {/* Secondary Action Button: Dark Pill "Delete Account" (Exact match to Image 2) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSheet('deleteAccount')}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 25,
                background: UI.card,
                border: UI.cardBorder,
                color: UI.danger,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Delete Account
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* ====================================================================
          SLIDE-OVER BOTTOM SHEETS (Retaining 100% of DROBE Fashion Content)
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
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
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
                background: UI.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTop: UI.cardBorder,
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
                  background: '#333342',
                  borderRadius: 2,
                  margin: '10px auto 14px'
                }}
              />

              {/* SHEET 1: MY ORDERS & 30-MIN TRACKING */}
              {activeSheet === 'orders' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>My Orders & 30-Min Tracking</h3>
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
                      { key: 'returns', label: 'Returns & Refunds' },
                      { key: 'coupons', label: 'Coupons' }
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setOrderTab(t.key as any)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          background: orderTab === t.key ? UI.accent : UI.pillBg,
                          color: orderTab === t.key ? '#000' : UI.textPrimary,
                          fontSize: 12,
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {orderTab === 'all' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {trialOrders.map(o => (
                        <div key={o.id} style={{ background: '#111118', border: UI.cardBorder, borderRadius: 14, padding: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: UI.accent }}>{o.orderNumber || o.id}</span>
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
                              background: UI.accent,
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
                      ))}
                    </div>
                  )}

                  {orderTab === 'returns' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ background: '#111118', border: UI.cardBorder, borderRadius: 14, padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: UI.accent, textTransform: 'uppercase' }}>
                          ✓ Instant Doorstep Refund Settled
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
                          Order #DRB-9842 (Mark Leute Heavy Hoodie)
                        </div>
                        <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 2 }}>
                          Returned during 6-min fitting. ₹1,499 credited instantly via UPI to {upiId}.
                        </div>
                      </div>
                    </div>
                  )}

                  {orderTab === 'coupons' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { code: 'DROBE30', discount: '₹500 OFF', desc: 'Valid on first 30-min express trial order' },
                        { code: 'FASHION30', discount: 'FREE 6-MIN TRIAL', desc: 'Complimentary doorstep fitting trial on all brands' }
                      ].map(c => (
                        <div key={c.code} style={{ background: '#111118', border: UI.cardBorder, borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{c.code} • {c.discount}</div>
                            <div style={{ fontSize: 11.5, color: UI.textSecondary, marginTop: 2 }}>{c.desc}</div>
                          </div>
                          <button
                            onClick={() => showToast(`Coupon ${c.code} copied!`)}
                            style={{ padding: '6px 12px', borderRadius: 8, background: UI.accent, color: '#000', border: 'none', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SHEET 2: PAYMENTS & REFUNDS */}
              {activeSheet === 'payments' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Payments & Billing</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Instant Doorstep UPI VPA */}
                  <div style={{ background: '#111118', border: UI.cardBorder, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: UI.accent, textTransform: 'uppercase', marginBottom: 4 }}>
                      ⚡ Instant Doorstep Refund VPA
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{upiId}</div>
                    <p style={{ fontSize: 11.5, color: UI.textSecondary, margin: '4px 0 10px 0' }}>
                      When you return unkept trial fits at your door, refunds are credited instantly to this UPI upon runner tag scan.
                    </p>
                    <button
                      onClick={() => showToast('UPI VPA verified and active')}
                      style={{ padding: '6px 12px', borderRadius: 8, background: UI.pillBg, border: UI.cardBorder, color: UI.textPrimary, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Edit UPI ID
                    </button>
                  </div>

                  {/* Tokenized Cards */}
                  <div style={{ background: '#111118', border: UI.cardBorder, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: UI.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                      Tokenized Cards (RBI Compliant)
                    </div>
                    {savedCards.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.bank} {c.type} •••• {c.last4}</div>
                          <div style={{ fontSize: 11, color: UI.textSecondary }}>Expires {c.expiry}</div>
                        </div>
                        <span style={{ fontSize: 11, color: UI.accent, fontWeight: 700 }}>Tokenized ✓</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, color: UI.textMuted, textAlign: 'center' }}>
                    🔒 DROBE uses PCI-DSS Level 1 tokenization. Raw card numbers, CVVs, and UPI PINs are never stored.
                  </div>
                </div>
              )}

              {/* SHEET 3: FASHION PREFERENCES (DROBE SPECIAL) */}
              {activeSheet === 'fashionPreferences' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Fashion Preferences</h3>
                      <p style={{ fontSize: 12, color: UI.textSecondary, margin: '2px 0 0 0' }}>
                        Personalize your 30-min doorstep wardrobe drops
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Preferred Styles */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      PREFERRED STYLES
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Streetwear', 'Casual', 'Minimal', 'Oversized', 'Ethnic', 'Formal', 'Athleisure', 'Partywear'].map(st => {
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
                              padding: '7px 14px',
                              borderRadius: 20,
                              background: isSelected ? UI.accent : UI.pillBg,
                              color: isSelected ? '#000000' : UI.textPrimary,
                              fontSize: 12,
                              fontWeight: isSelected ? 800 : 600,
                              border: isSelected ? 'none' : UI.pillBorder,
                              cursor: 'pointer'
                            }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Size */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      TOP SIZE (SHIRTS / POLOS / HOODIES)
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
                            background: fashionPrefs.topSize === sz ? UI.accent : UI.pillBg,
                            color: fashionPrefs.topSize === sz ? '#000000' : UI.textPrimary,
                            fontSize: 13,
                            fontWeight: 800,
                            border: 'none',
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
                      BOTTOM SIZE (JEANS / TROUSERS / CARGOS)
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
                            background: fashionPrefs.bottomSize === sz ? UI.accent : UI.pillBg,
                            color: fashionPrefs.bottomSize === sz ? '#000000' : UI.textPrimary,
                            fontSize: 13,
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Followed Brands */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: UI.textSecondary, display: 'block', marginBottom: 8 }}>
                      FAVOURITE BRANDS (FOLLOW FOR NEW DROPS)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['SNITCH', 'The Souled Store', 'Tilt', 'Mark Leute', 'Bluorng', 'VegNonVeg', 'Urban Monkey', 'Huemn'].map(b => {
                        const isFav = fashionPrefs.brands.includes(b);
                        return (
                          <button
                            key={b}
                            onClick={() => {
                              setFashionPrefs(prev => ({
                                ...prev,
                                brands: isFav ? prev.brands.filter(x => x !== b) : [...prev.brands, b]
                              }));
                            }}
                            style={{
                              padding: '7px 14px',
                              borderRadius: 20,
                              background: isFav ? UI.accent : UI.pillBg,
                              color: isFav ? '#000000' : UI.textPrimary,
                              fontSize: 12,
                              fontWeight: isFav ? 800 : 600,
                              border: isFav ? 'none' : UI.pillBorder,
                              cursor: 'pointer'
                            }}
                          >
                            {isFav ? '✓ ' : '+ '}{b}
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
                      showToast('Fashion preferences updated! ✨');
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      borderRadius: 25,
                      background: UI.accent,
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
                    {addresses.map(addr => (
                      <div key={addr.id} style={{ background: '#111118', border: addr.isDefault ? `1.5px solid ${UI.accent}` : UI.cardBorder, borderRadius: 14, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, background: UI.pillBg, padding: '2px 8px', borderRadius: 6 }}>
                            {addr.tag}
                          </span>
                          {addr.isDefault && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: UI.accent }}>Default Address ✓</span>
                          )}
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{addr.recipient}</div>
                        <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 2 }}>{addr.line1}, {addr.line2} - {addr.pincode}</div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => showToast('Address selection updated for 30-min express deliveries!')}
                    style={{
                      width: '100%',
                      padding: '13px 0',
                      borderRadius: 25,
                      background: UI.accent,
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

              {/* SHEET 5: HELP & CONCIERGE */}
              {activeSheet === 'helpSupport' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Help & Concierge Support</h3>
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
                        borderRadius: 16,
                        background: '#25d366',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: 13.5,
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      Chat with Drobe Concierge on WhatsApp
                    </a>

                    <a
                      href="tel:+919825088123"
                      style={{
                        padding: '14px 16px',
                        borderRadius: 16,
                        background: UI.pillBg,
                        border: UI.cardBorder,
                        color: UI.textPrimary,
                        textDecoration: 'none',
                        fontSize: 13.5,
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      Call Darkstore Hub (+91 98250 88123)
                    </a>
                  </div>

                  {/* FAQs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { q: 'How does 30-minute delivery work?', a: 'Orders are dispatched directly from Ahmedabad Hub #01 to your door using rapid EV runners.' },
                      { q: 'What is the 6-minute doorstep trial?', a: 'Our runner waits 6 minutes while you try on your fits. Keep what fits and hand back what does not.' },
                      { q: 'How do instant doorstep refunds work?', a: 'Returned items are scanned on the spot, triggering immediate UPI credit to your verified VPA.' }
                    ].map((f, i) => (
                      <div key={i} style={{ background: '#111118', border: UI.cardBorder, borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{f.q}</div>
                        <div style={{ fontSize: 12, color: UI.textSecondary, marginTop: 4 }}>{f.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SHEET 6: DELETE ACCOUNT */}
              {activeSheet === 'deleteAccount' && (
                <div style={{ padding: '0 20px 30px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: UI.danger }}>Delete Account</h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: 'none', border: 'none', color: UI.textSecondary, cursor: 'pointer', padding: 4 }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p style={{ fontSize: 13, color: UI.textSecondary, lineHeight: 1.5, marginBottom: 18 }}>
                    Deleting your account will permanently wipe your profile, saved measurements, and fashion preferences.
                    In accordance with statutory tax and accounting regulations, historical order fulfillment records are retained for compliance.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSheet(null)}
                      style={{
                        flex: 1,
                        padding: '13px 0',
                        borderRadius: 20,
                        background: UI.pillBg,
                        border: UI.cardBorder,
                        color: UI.textPrimary,
                        fontSize: 13,
                        fontWeight: 700,
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
                        padding: '13px 0',
                        borderRadius: 20,
                        background: UI.danger,
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
