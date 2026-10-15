'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrialOrders, TrialOrder } from '@/app/lib/darkstoreData';
import { 
  Check, 
  ChevronRight, 
  Settings as SettingsIcon, 
  Flame, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Camera, 
  Bell, 
  Sliders, 
  Moon, 
  Globe, 
  Users, 
  HelpCircle, 
  Info, 
  ShieldCheck, 
  LogOut, 
  ArrowLeft,
  Package,
  Layers,
  Award,
  Zap,
  MapPin
} from 'lucide-react';

// Apple System Font Stack
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", -apple-system-subheadline, "Helvetica Neue", Helvetica, Arial, sans-serif';

// Accent Color (Sober Lime matching reference)
const ACCENT_COLOR = '#d4f938';

/**
 * Native iOS / Mobile Spring Toggle Switch
 */
function NativeToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 50,
        height: 30,
        borderRadius: 15,
        background: checked ? ACCENT_COLOR : '#26262e',
        border: 'none',
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        outline: 'none',
        flexShrink: 0
      }}
      aria-label="Toggle Switch"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          background: checked ? '#000000' : '#ffffff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }}
      />
    </motion.button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser, wishlist } = useApp();

  // Screen View: 'profile' (Main My profile) | 'settings' | 'editProfile'
  const [currentView, setCurrentView] = useState<'profile' | 'settings' | 'editProfile'>('profile');

  // Active Tab under Profile: 'feed' | 'challenge' | 'badge'
  const [activeTab, setActiveTab] = useState<'feed' | 'challenge' | 'badge'>('feed');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'Budiarti Ramlan',
    username: '@budiarti12',
    phone: user?.phone || '1234-5678-987',
    email: 'budiartiram@email.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    streakCount: 5,
    followers: '10.2k',
    following: '142'
  });

  // Settings Toggles State
  const [pauseNotifications, setPauseNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English (IN)');

  // Feed Interactive Likes
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(40);

  // Doorstep UPI State
  const [upiId, setUpiId] = useState('aman@okhdfcbank');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [tempUpi, setTempUpi] = useState('aman@okhdfcbank');

  // FAQ Modal
  const [showFaqModal, setShowFaqModal] = useState(false);

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
      const savedUpi = localStorage.getItem('drobe_doorstep_upi');
      if (savedUpi) {
        setUpiId(savedUpi);
        setTempUpi(savedUpi);
      }
    } catch {}
  }, []);

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      showToast('Liked fit! ❤️');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) {
      showToast('Name cannot be empty');
      return;
    }
    if (user) {
      user.name = profileData.fullName;
    }
    setCurrentView('settings');
    showToast('Profile updated successfully! ✅');
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUpi.includes('@')) {
      showToast('Please enter a valid UPI ID');
      return;
    }
    setUpiId(tempUpi.trim());
    try {
      localStorage.setItem('drobe_doorstep_upi', tempUpi.trim());
    } catch {}
    setShowUpiModal(false);
    showToast('UPI ID saved for instant refunds! ⚡');
  };

  const handleLogout = () => {
    logoutUser();
    showToast('Logged out securely');
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0d0d11',
        color: '#ffffff',
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
              top: 18,
              left: 20,
              right: 20,
              zIndex: 100,
              background: '#1c1c24',
              color: '#ffffff',
              border: '1px solid #2e2f3d',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Container with AnimatePresence Page Transition */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <AnimatePresence mode="wait">
          
          {/* ====================================================================
              VIEW 1: "MY PROFILE" (Screen 1 in Reference)
              ==================================================================== */}
          {currentView === 'profile' && (
            <motion.div
              key="view-profile"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 90px' }}
            >
              {/* Top Navigation Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  marginBottom: 20
                }}
              >
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.02em'
                  }}
                >
                  My profile
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Streak Count Badge Button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: '#18181f',
                      border: '1px solid #262632',
                      padding: '6px 12px',
                      borderRadius: 20,
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onClick={() => showToast('5 Day Ahmedabad Darkstore Streak! 🔥')}
                  >
                    <Flame size={15} color="#f59e0b" fill="#f59e0b" />
                    <span>{profileData.streakCount}</span>
                  </motion.button>

                  {/* Settings Gear Button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.90 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={() => setCurrentView('settings')}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#18181f',
                      border: '1px solid #262632',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4d4d8',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    aria-label="Settings"
                  >
                    <SettingsIcon size={17} />
                  </motion.button>
                </div>
              </div>

              {/* Profile Hero Avatar & Name */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <img
                    src={profileData.avatar}
                    alt={profileData.fullName}
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2.5px solid #262633',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Name + Verified Checkmark Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <h2
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {profileData.fullName}
                  </h2>
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={11} color="#000000" strokeWidth={3.5} />
                  </div>
                </div>

                {/* Stats / Followers Subtitle */}
                <p
                  style={{
                    fontSize: 12.5,
                    color: '#8e8e93',
                    margin: '6px 0 0 0',
                    fontWeight: 500
                  }}
                >
                  {profileData.followers} followers • {profileData.following} following
                </p>
              </div>

              {/* Segmented Filter Tabs (Feed · Challenge · Badge) */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 22,
                  marginBottom: 16
                }}
              >
                {[
                  { id: 'feed', label: 'Feed', icon: <Layers size={14} /> },
                  { id: 'challenge', label: 'Challenge', icon: <Zap size={14} /> },
                  { id: 'badge', label: 'Badge', icon: <Award size={14} /> }
                ].map(tab => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 14,
                        border: isSelected ? 'none' : '1px solid #23232c',
                        background: isSelected ? ACCENT_COLOR : '#16161c',
                        color: isSelected ? '#000000' : '#8e8e93',
                        fontSize: 13,
                        fontWeight: isSelected ? 800 : 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Tab 1: FEED VIEW */}
              {activeTab === 'feed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Reference Image Feed Post Card */}
                  <div
                    style={{
                      background: '#16161c',
                      border: '1px solid #23232c',
                      borderRadius: 18,
                      padding: 14
                    }}
                  >
                    {/* Author Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={profileData.avatar}
                          alt={profileData.fullName}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                            {profileData.fullName}.
                          </div>
                          <div style={{ fontSize: 11, color: '#71717a' }}>3h ago</div>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#71717a',
                          cursor: 'pointer',
                          padding: 4
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </motion.button>
                    </div>

                    {/* Post Caption */}
                    <p
                      style={{
                        fontSize: 13.5,
                        color: '#f4f4f5',
                        margin: '0 0 12px 0',
                        fontWeight: 500
                      }}
                    >
                      Signature knit fits tried at doorstep 😍🌱
                    </p>

                    {/* Media Preview Image */}
                    <div
                      style={{
                        width: '100%',
                        height: 220,
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#0e0e12',
                        marginBottom: 12
                      }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
                        alt="Fit Lookbook"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Interaction Buttons Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Comments */}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.90 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'none',
                          border: 'none',
                          color: '#a1a1aa',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                        onClick={() => showToast('12 comments on this fit')}
                      >
                        <MessageCircle size={16} />
                        <span>12</span>
                      </motion.button>

                      {/* Heart / Like */}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.86 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'none',
                          border: 'none',
                          color: liked ? '#ef4444' : '#a1a1aa',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                        onClick={handleToggleLike}
                      >
                        <Heart size={16} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#a1a1aa'} />
                        <span>{likeCount}</span>
                      </motion.button>

                      <div style={{ flex: 1 }} />

                      {/* Share */}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.90 }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#71717a',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        onClick={() => showToast('Fit link copied! 🔗')}
                      >
                        <Share2 size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Second Feed Card: Ahmedabad Hub Fast Delivery */}
                  <div
                    style={{
                      background: '#16161c',
                      border: '1px solid #23232c',
                      borderRadius: 18,
                      padding: 14
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#1e2029',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: ACCENT_COLOR
                        }}
                      >
                        <Zap size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                          Ahmedabad Darkstore Hub #01
                        </div>
                        <div style={{ fontSize: 11, color: '#71717a' }}>Shivam Bungalows 1, Koteshwar Rd</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12.5, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                      Express 30-min doorstep fitting active across your zone. Zero prepay on Try & Buy bag.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: CHALLENGE / ORDERS VIEW */}
              {activeTab === 'challenge' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {trialOrders.length > 0 ? (
                    trialOrders.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          background: '#16161c',
                          border: '1px solid #23232c',
                          borderRadius: 16,
                          padding: 14
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: ACCENT_COLOR }}>
                            {order.orderNumber || order.id}
                          </span>
                          <span style={{ fontSize: 11, color: '#8e8e93' }}>
                            {order.dispatchedAt || 'Today'}
                          </span>
                        </div>

                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                          {order.status}
                        </div>

                        <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 12 }}>
                          {order.brandName} • {order.productName} ({order.size}) • {order.price}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/order-portal')}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: 10,
                              background: '#ffffff',
                              color: '#000000',
                              fontSize: 12,
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Live Runner Tracking
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/categories')}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 10,
                              background: '#23232c',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Reorder
                          </motion.button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 16px',
                        background: '#16161c',
                        borderRadius: 16,
                        border: '1px solid #23232c'
                      }}
                    >
                      <Package size={32} color="#71717a" style={{ margin: '0 auto 10px' }} />
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
                        No Active Orders
                      </h4>
                      <p style={{ fontSize: 12, color: '#8e8e93', marginTop: 4 }}>
                        Experience 30-min doorstep fitting in Ahmedabad.
                      </p>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.push('/')}
                        style={{
                          marginTop: 14,
                          padding: '8px 18px',
                          borderRadius: 10,
                          background: ACCENT_COLOR,
                          color: '#000',
                          fontWeight: 800,
                          fontSize: 12,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Explore Wardrobe
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: BADGE / SAVED FITS VIEW */}
              {activeTab === 'badge' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    style={{
                      background: '#16161c',
                      border: '1px solid #23232c',
                      borderRadius: 16,
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: '#1c202a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f59e0b'
                      }}
                    >
                      <Award size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>
                        Ahmedabad VIP Member
                      </div>
                      <div style={{ fontSize: 12, color: '#8e8e93' }}>
                        Verified door trial access • 30-Min Fast Track
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#16161c',
                      border: '1px solid #23232c',
                      borderRadius: 16,
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff' }}>
                        Wishlisted Fits
                      </div>
                      <div style={{ fontSize: 12, color: '#8e8e93' }}>
                        {wishlist.length} items saved for instant trial
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => router.push('/trends')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        background: '#23232c',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      View Wishlist
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ====================================================================
              VIEW 2: "SETTINGS" (Screen 2 in Reference)
              ==================================================================== */}
          {currentView === 'settings' && (
            <motion.div
              key="view-settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 90px' }}
            >
              {/* Top Centered Header with Back Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  marginBottom: 18
                }}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => setCurrentView('profile')}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#18181f',
                    border: '1px solid #262632',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </motion.button>

                <h1
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Settings
                </h1>

                {/* Empty placeholder for symmetrical centering */}
                <div style={{ width: 36 }} />
              </div>

              {/* Profile Row Card (Clicking opens Edit Profile) */}
              <motion.div
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => setCurrentView('editProfile')}
                style={{
                  background: '#16161c',
                  border: '1px solid #23232c',
                  borderRadius: 16,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={profileData.avatar}
                    alt={profileData.fullName}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                      {profileData.fullName}
                    </div>
                    <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 1 }}>
                      {profileData.username}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} color="#71717a" />
              </motion.div>

              {/* Group 1: Notifications & General Settings */}
              <div
                style={{
                  background: '#16161c',
                  border: '1px solid #23232c',
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 14
                }}
              >
                {/* Row: Pause notifications */}
                <div
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Bell size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      Pause notifications
                    </span>
                  </div>
                  <NativeToggle
                    checked={pauseNotifications}
                    onChange={() => {
                      setPauseNotifications(prev => !prev);
                      showToast(pauseNotifications ? 'Notifications Resumed' : 'Notifications Paused');
                    }}
                  />
                </div>

                <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                {/* Row: General settings */}
                <motion.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => showToast('Delivery Hub: Ahmedabad Darkstore Hub #01')}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Sliders size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      General settings
                    </span>
                  </div>
                  <ChevronRight size={18} color="#71717a" />
                </motion.div>
              </div>

              {/* Group 2: Display, Language & Contact */}
              <div
                style={{
                  background: '#16161c',
                  border: '1px solid #23232c',
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 14
                }}
              >
                {/* Row: Dark mode */}
                <div
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Moon size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      Dark mode
                    </span>
                  </div>
                  <NativeToggle
                    checked={darkMode}
                    onChange={() => {
                      setDarkMode(prev => !prev);
                      showToast('Drobe Dark Aesthetic active');
                    }}
                  />
                </div>

                <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                {/* Row: Language */}
                <motion.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => showToast(`Language: ${selectedLanguage}`)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      Language
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12.5, color: '#8e8e93' }}>{selectedLanguage}</span>
                    <ChevronRight size={18} color="#71717a" />
                  </div>
                </motion.div>

                <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                {/* Row: My Contact / Instant Refund UPI */}
                <motion.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setShowUpiModal(true)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Users size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      My Contact & Doorstep UPI
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12.5, color: ACCENT_COLOR, fontWeight: 600 }}>{upiId}</span>
                    <ChevronRight size={18} color="#71717a" />
                  </div>
                </motion.div>
              </div>

              {/* Group 3: Policies & FAQ */}
              <div
                style={{
                  background: '#16161c',
                  border: '1px solid #23232c',
                  borderRadius: 16,
                  overflow: 'hidden',
                  marginBottom: 20
                }}
              >
                {/* FAQ */}
                <motion.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setShowFaqModal(true)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <HelpCircle size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      FAQ & Doorstep Fitting
                    </span>
                  </div>
                  <ChevronRight size={18} color="#71717a" />
                </motion.div>

                <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                {/* Terms of Service */}
                <motion.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => showToast('Drobe Terms of Service: 100% Verified Authentic SKUs')}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Info size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      Terms of service
                    </span>
                  </div>
                  <ChevronRight size={18} color="#71717a" />
                </motion.div>

                <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                {/* User Policy */}
                <motion.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => showToast('Drobe Zero Prepay User Policy')}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldCheck size={18} color="#a1a1aa" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                      User policy
                    </span>
                  </div>
                  <ChevronRight size={18} color="#71717a" />
                </motion.div>
              </div>

              {/* Log Out Button (Clean card matching reference image) */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={handleLogout}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 16,
                  background: '#ffffff',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: 14,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </motion.button>
            </motion.div>
          )}

          {/* ====================================================================
              VIEW 3: "EDIT PROFILE" (Screen 3 in Reference)
              ==================================================================== */}
          {currentView === 'editProfile' && (
            <motion.div
              key="view-edit-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 90px' }}
            >
              {/* Top Centered Header with Back Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  marginBottom: 20
                }}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => setCurrentView('settings')}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#18181f',
                    border: '1px solid #262632',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </motion.button>

                <h1
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Edit Profile
                </h1>

                {/* Placeholder for symmetric header */}
                <div style={{ width: 36 }} />
              </div>

              {/* Avatar with Camera Badge Overlay */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={profileData.avatar}
                    alt={profileData.fullName}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #282834'
                    }}
                  />

                  {/* Camera Icon Badge Button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    onClick={() => showToast('Upload photo from device')}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: ACCENT_COLOR,
                      border: '2px solid #0d0d11',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    aria-label="Change Photo"
                  >
                    <Camera size={15} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>

              {/* Grouped Form Fields Card */}
              <form onSubmit={handleSaveProfile}>
                <div
                  style={{
                    background: '#16161c',
                    border: '1px solid #23232c',
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 24
                  }}
                >
                  {/* Full name */}
                  <div
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: '#8e8e93', fontWeight: 500, width: 110 }}>
                      Full name
                    </span>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        outline: 'none',
                        fontFamily: FONT_FAMILY
                      }}
                      placeholder="Your name"
                    />
                  </div>

                  <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                  {/* Phone number */}
                  <div
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: '#8e8e93', fontWeight: 500, width: 110 }}>
                      Phone number
                    </span>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        outline: 'none',
                        fontFamily: FONT_FAMILY
                      }}
                      placeholder="Phone number"
                    />
                  </div>

                  <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                  {/* Email */}
                  <div
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: '#8e8e93', fontWeight: 500, width: 110 }}>
                      Email
                    </span>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        outline: 'none',
                        fontFamily: FONT_FAMILY
                      }}
                      placeholder="Email address"
                    />
                  </div>

                  <div style={{ height: 1, background: '#202028', margin: '0 16px' }} />

                  {/* Username */}
                  <div
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: '#8e8e93', fontWeight: 500, width: 110 }}>
                      Username
                    </span>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        outline: 'none',
                        fontFamily: FONT_FAMILY
                      }}
                      placeholder="@username"
                    />
                  </div>
                </div>

                {/* Save Changes Button (Sober Solid Button matching reference) */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 16,
                    background: ACCENT_COLOR,
                    border: 'none',
                    color: '#000000',
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    marginBottom: 20
                  }}
                >
                  Save Changes
                </motion.button>
              </form>

              {/* Secondary Action: Delete Account */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showToast('Account reset to default')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#71717a',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 16px'
                  }}
                >
                  Delete Account
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Doorstep UPI Modal */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 80,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
            onClick={() => setShowUpiModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              style={{
                width: '100%',
                maxWidth: 360,
                background: '#16161c',
                border: '1px solid #282834',
                borderRadius: 20,
                padding: 20
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
                Instant Doorstep UPI Refund
              </h3>
              <p style={{ fontSize: 12.5, color: '#8e8e93', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                When you return unkept trial items at your doorstep, refunds are credited instantly to this VPA.
              </p>

              <form onSubmit={handleSaveUpi}>
                <input
                  type="text"
                  value={tempUpi}
                  onChange={(e) => setTempUpi(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#0d0d11',
                    border: '1px solid #282834',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none',
                    marginBottom: 16,
                    fontFamily: FONT_FAMILY
                  }}
                  placeholder="e.g. mobile@upi"
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUpiModal(false)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 12,
                      background: '#23232c',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 12,
                      background: ACCENT_COLOR,
                      color: '#000000',
                      fontSize: 13,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Save UPI
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Modal */}
      <AnimatePresence>
        {showFaqModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 80,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
            onClick={() => setShowFaqModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              style={{
                width: '100%',
                maxWidth: 380,
                maxHeight: '80vh',
                overflowY: 'auto',
                background: '#16161c',
                border: '1px solid #282834',
                borderRadius: 20,
                padding: 22
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 12px 0', color: '#fff' }}>
                Drobe Doorstep Fitting FAQ
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                    How does 30-min Try & Buy work?
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.45 }}>
                    Your darkstore bag arrives in 30 minutes. You try fits for up to 15 minutes at your door. Keep what you love, hand back what you don't.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                    Do I prepay for returned fits?
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.45 }}>
                    Zero prepay! You only pay for items you keep via UPI, cards, or cash directly upon handover.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                    Are items 100% genuine?
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.45 }}>
                    Every item is verified and directly sourced from approved brands shelved at Ahmedabad Darkstore Hub.
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowFaqModal(false)}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '11px 0',
                  borderRadius: 12,
                  background: '#23232c',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation with Native Tap Feedback */}
      <BottomNav />
    </div>
  );
}
