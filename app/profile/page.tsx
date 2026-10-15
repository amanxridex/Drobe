'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrialOrders, TrialOrder } from '@/app/lib/darkstoreData';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loginUser, logoutUser, setIsAuthOpen, setIsLocationOpen, location, wishlist, orders: contextOrders } = useApp();

  // Active Bottom Sheet Modal state
  const [activeSheet, setActiveSheet] = useState<'orders' | 'upi' | 'notifications' | 'guarantees' | 'editProfile' | null>(null);

  // Doorstep Refund UPI State
  const [upiId, setUpiId] = useState('aman@okhdfcbank');
  const [tempUpi, setTempUpi] = useState('aman@okhdfcbank');
  const [isUpiVerified, setIsUpiVerified] = useState(true);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    whatsappOrder: true,
    smsOtp: true,
    flashDrops: true
  });

  // Edit Profile Name
  const [editName, setEditName] = useState(user?.name || 'Aman Rider');

  // Interactive Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load trial orders from darkstore + context
  const [trialOrders, setTrialOrders] = useState<TrialOrder[]>([]);

  useEffect(() => {
    try {
      const storedUpi = localStorage.getItem('drobe_doorstep_upi');
      if (storedUpi) {
        setUpiId(storedUpi);
        setTempUpi(storedUpi);
      }
      const allOrders = getTrialOrders();
      if (allOrders && allOrders.length > 0) {
        setTrialOrders(allOrders);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.name) {
      setEditName(user.name);
    }
  }, [user]);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUpi.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. mobile@upi)');
      return;
    }
    setUpiId(tempUpi.trim());
    setIsUpiVerified(true);
    try {
      localStorage.setItem('drobe_doorstep_upi', tempUpi.trim());
    } catch {}
    setActiveSheet(null);
    showToast('UPI ID saved for Instant Doorstep Refunds! ⚡');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    if (user) {
      user.name = editName.trim();
    }
    setActiveSheet(null);
    showToast('Profile updated successfully!');
  };

  // Find active ongoing order if any
  const ongoingOrder = trialOrders.find((o) => 
    o.status === 'Out for 30-Min Delivery' || 
    o.status === 'Doorstep Fitting (Runner Waiting Outside)' || 
    o.status === 'Picked & Packed in Trial Bag' ||
    o.status === 'Runner Assigned (Ready for Handover)' ||
    o.status === 'Order Received (Awaiting Picker)'
  ) || trialOrders[0];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0e0e13', overflow: 'hidden' }}>
      {/* ========================================================
          1. SLEEK STICKY HEADER
          ======================================================== */}
      <header
        style={{
          padding: '14px 16px',
          background: 'rgba(18, 18, 24, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1f1f2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: '#1a1a24',
              border: '1px solid #282838',
              borderRadius: 12,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'transform 0.15s ease'
            }}
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              My Account
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              DROBE VIP
            </span>
          </div>
        </div>

        {/* WhatsApp Quick Concierge Icon */}
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(37, 211, 102, 0.12)',
            border: '1px solid rgba(37, 211, 102, 0.28)',
            padding: '6px 10px',
            borderRadius: 20,
            textDecoration: 'none',
            color: '#25d366',
            fontSize: 11,
            fontWeight: 700
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25d366', boxShadow: '0 0 8px #25d366' }} />
          <span>Help</span>
        </a>
      </header>

      {/* ========================================================
          2. SCROLLABLE MAIN CONTENT
          ======================================================== */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 90px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Guest or Logged In User Hero Card */}
        {!user ? (
          /* ========================================================
              A. GUEST VIP ONBOARDING CARD (High-End Dark Aesthetic)
              ======================================================== */
          <div
            style={{
              position: 'relative',
              borderRadius: 22,
              padding: '20px 18px',
              background: 'linear-gradient(145deg, #181826 0%, #101018 100%)',
              border: '1px solid #28283c',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(79, 103, 255, 0.08)',
              overflow: 'hidden',
              marginBottom: 16
            }}
          >
            {/* Subtle Neon Radial Glow Accent */}
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79, 103, 255, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            {/* Brand Emblem & Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src="/drobe-emblem-white.png" alt="DROBE" style={{ height: 20, width: 'auto' }} />
                <img src="/drobe-wordmark-white.png" alt="DROBE" style={{ height: 14, width: 'auto' }} />
              </div>
              <span
                style={{
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: 6,
                  letterSpacing: '0.04em'
                }}
              >
                VIP ACCESS
              </span>
            </div>

            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
              Your 60-Minute Wardrobe
            </h2>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>
              Sign in with your mobile number to track live darkstore riders, doorstep try-ons, and unlock ₹250 Drobe Cash.
            </p>

            {/* 3 Highlight Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', background: '#132334', border: '1px solid #1e3a58', padding: '4px 8px', borderRadius: 8 }}>
                ⚡ 60-Min Delivery
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', background: '#201b34', border: '1px solid #352b56', padding: '4px 8px', borderRadius: 8 }}>
                👕 Doorstep Try-On
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: '#142921', border: '1px solid #1c4535', padding: '4px 8px', borderRadius: 8 }}>
                🔄 Instant Return
              </span>
            </div>

            {/* Log In CTA Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #4f67ff 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '13px',
                fontSize: 14,
                fontWeight: 800,
                marginTop: 16,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(79, 103, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease'
              }}
            >
              <span>Log In / Sign Up</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#71717a', marginTop: 8 }}>
              Fast 1-tap OTP verification • Zero password hassle
            </div>
          </div>
        ) : (
          /* ========================================================
              B. LOGGED IN MEMBER CARD
              ======================================================== */
          <div
            style={{
              borderRadius: 22,
              padding: '18px 16px',
              background: 'linear-gradient(145deg, #1a1a26 0%, #12121c 100%)',
              border: '1px solid #28283a',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 16
            }}
          >
            {/* Glowing Avatar */}
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f67ff 0%, #ec4899 100%)',
                padding: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#151520',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#ffffff'
                }}
              >
                {user.name?.[0] || 'D'}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </h2>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#10b981',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4
                  }}
                >
                  VIP
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
                {user.phone || '+91 98765 43210'}
              </p>
              <button
                onClick={() => setActiveSheet('editProfile')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: 0,
                  marginTop: 4,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span>Edit Profile</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Logout Action */}
            <button
              onClick={() => {
                logoutUser();
                showToast('Logged out successfully');
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#242028',
                border: '1px solid #382830',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Log Out"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        )}

        {/* ========================================================
            3. DROBE CASH & REWARDS CARD (Universal Wallet)
            ======================================================== */}
        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            padding: '16px',
            background: 'linear-gradient(135deg, #132236 0%, #0d1624 100%)',
            border: '1px solid #203c58',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
            overflow: 'hidden'
          }}
        >
          {/* Watermark Logo */}
          <div
            style={{
              position: 'absolute',
              right: -10,
              bottom: -15,
              opacity: 0.08,
              pointerEvents: 'none'
            }}
          >
            <img src="/drobe-emblem-white.png" alt="" style={{ height: 100, width: 'auto' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                DROBE CASH WALLET
              </span>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                ACTIVE
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', marginTop: 4, letterSpacing: '-0.02em' }}>
              ₹{user ? (user.drobeCash || 250) : 250}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Auto-applies at checkout on 60-min orders
            </div>
          </div>

          <button
            onClick={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                showToast('₹250 Drobe Cash is already active on your account!');
              }
            }}
            style={{
              background: '#203a58',
              border: '1px solid #38bdf8',
              borderRadius: 12,
              padding: '8px 14px',
              color: '#38bdf8',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {user ? 'Active' : 'Claim ₹250'}
          </button>
        </div>

        {/* ========================================================
            4. ACTIVE 60-MIN ORDER HIGHLIGHT (If Any Exists)
            ======================================================== */}
        {ongoingOrder && (
          <div
            onClick={() => router.push(`/order/${ongoingOrder.id}`)}
            style={{
              background: '#151b24',
              border: '1px solid #233549',
              borderRadius: 16,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(0, 230, 118, 0.15)',
                  border: '1px solid rgba(0, 230, 118, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: 16 }}>⚡</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                    {ongoingOrder.status}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {ongoingOrder.orderNumber} • ETA ~25 mins
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00e676', fontSize: 11, fontWeight: 700 }}>
              <span>Track Live</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        )}

        {/* ========================================================
            5. GROUPED SETTINGS MENU (Sleek Grouped Cards)
            ======================================================== */}

        {/* --- GROUP 1: Orders & Wishlist --- */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 6 }}>
            Orders & Shopping
          </div>
          <div
            style={{
              background: '#171720',
              borderRadius: 18,
              border: '1px solid #23232f',
              overflow: 'hidden'
            }}
          >
            {/* My Orders */}
            <div
              onClick={() => setActiveSheet('orders')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: '1px solid #20202c',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(79, 103, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/icons/box_ver2.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>My Orders & Deliveries</div>
                  <div style={{ fontSize: 11, color: '#888898' }}>Active 60-min orders, doorstep trials & receipts</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {trialOrders.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#252538', color: '#4f67ff', padding: '2px 8px', borderRadius: 10 }}>
                    {trialOrders.length}
                  </span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

            {/* My Wishlist */}
            <Link
              href="/cart"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/icons/heart_wishlist_v3.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>My Wishlist & Fits</div>
                  <div style={{ fontSize: 11, color: '#888898' }}>{wishlist.length} saved item{wishlist.length === 1 ? '' : 's'} ready for 60-min trial</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ec4899', background: 'rgba(236, 72, 153, 0.12)', padding: '2px 8px', borderRadius: 10 }}>
                  {wishlist.length}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* --- GROUP 2: Delivery & Fast Refunds --- */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 6 }}>
            Delivery & Doorstep Refunds
          </div>
          <div
            style={{
              background: '#171720',
              borderRadius: 18,
              border: '1px solid #23232f',
              overflow: 'hidden'
            }}
          >
            {/* Saved Addresses */}
            <div
              onClick={() => setIsLocationOpen(true)}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: '1px solid #20202c'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/assets/icons/pin_marker_outline_v3.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Delivery Address</div>
                  <div style={{ fontSize: 11, color: '#888898', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {location}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4f67ff' }}>Change</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

            {/* Instant Refund UPI */}
            <div
              onClick={() => setActiveSheet('upi')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/icons/bank.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Instant Doorstep Refund UPI</div>
                  <div style={{ fontSize: 11, color: '#888898' }}>{upiId} (10-min refund)</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: 4 }}>
                  VERIFIED
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* --- GROUP 3: Preferences & Guarantees --- */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 6 }}>
            Preferences & Trust
          </div>
          <div
            style={{
              background: '#171720',
              borderRadius: 18,
              border: '1px solid #23232f',
              overflow: 'hidden'
            }}
          >
            {/* Notification Settings */}
            <div
              onClick={() => setActiveSheet('notifications')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: '1px solid #20202c'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/icons/bell.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Notification Settings</div>
                  <div style={{ fontSize: 11, color: '#888898' }}>WhatsApp live rider tracking & SMS PINs</div>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>

            {/* Drobe Guarantees (Physical Try-on & Instant Return) */}
            <div
              onClick={() => setActiveSheet('guarantees')}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/icons/how_it_works_return_instantly.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Drobe Guarantees & Policy</div>
                  <div style={{ fontSize: 11, color: '#888898' }}>Physical try-on, instant return & 100% genuine fits</div>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* --- GROUP 4: VIP Support --- */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 6 }}>
            VIP Support & Concierge
          </div>
          <div
            style={{
              background: '#171720',
              borderRadius: 18,
              border: '1px solid #23232f',
              overflow: 'hidden'
            }}
          >
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(37, 211, 102, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/icons/icon_whatsapp_contact_us.svg" alt="" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>WhatsApp 24/7 VIP Concierge</div>
                  <div style={{ fontSize: 11, color: '#888898' }}>Direct chat with darkstore dispatcher & stylist</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(37, 211, 102, 0.15)', color: '#25d366', padding: '2px 8px', borderRadius: 4 }}>
                  ONLINE
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666678" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* Footer Brand Info */}
        <div style={{ textAlign: 'center', padding: '12px 0 24px', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <img src="/drobe-emblem-white.png" alt="" style={{ height: 14, width: 'auto' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>DROBE</span>
          </div>
          <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>
            Ultra-Fast 60-Minute Fashion Delivery • v2.4.0
          </p>
          <p style={{ fontSize: 10, color: '#52525b', marginTop: 2 }}>
            Ahmedabad & Mumbai Darkstore Hubs
          </p>
        </div>
      </main>

      {/* ========================================================
          BOTTOM NAV
          ======================================================== */}
      <BottomNav />

      {/* ========================================================
          INTERACTIVE BOTTOM SHEETS & DRAWERS (Zero Browser Alerts)
          ======================================================== */}
      <AnimatePresence>
        {activeSheet && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
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
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#161620',
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                border: '1px solid #28283a',
                padding: '20px 18px 36px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              {/* Drawer Grab Bar */}
              <div style={{ width: 40, height: 4, background: '#36364a', borderRadius: 99, margin: '0 auto 16px' }} />

              {/* SHEET 1: MY ORDERS & TRIAL DELIVERIES */}
              {activeSheet === 'orders' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        My Orders & Trials
                      </h3>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                        Track 60-minute express deliveries and doorstep trial history
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: '#252534', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>

                  {trialOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>No Active Orders Yet</div>
                      <p style={{ fontSize: 12, color: '#71717a', maxWidth: 260, margin: '6px auto 16px' }}>
                        Browse trendy styles and experience 60-minute doorstep try-on!
                      </p>
                      <button
                        onClick={() => {
                          setActiveSheet(null);
                          router.push('/');
                        }}
                        style={{
                          background: '#4f67ff',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Explore Drops
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {trialOrders.map((ord) => (
                        <div
                          key={ord.id}
                          style={{
                            background: '#1d1d29',
                            border: '1px solid #28283a',
                            borderRadius: 16,
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                              {ord.orderNumber}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: ord.status.includes('Completed') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                color: ord.status.includes('Completed') ? '#10b981' : '#38bdf8'
                              }}
                            >
                              {ord.status}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <img
                              src={ord.items?.[0]?.thumbnail || '/assets/real/sections/15_sports_unleashed_4.webp'}
                              alt=""
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#252534' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ord.items?.[0]?.productName || ord.productName || 'Fashion Trial Order'}
                              </div>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                {ord.items?.length || 1} item(s) • {ord.advancePaidAmount ? `₹${ord.advancePaidAmount}` : (ord.price || '₹742')}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setActiveSheet(null);
                              router.push(`/order/${ord.id}`);
                            }}
                            style={{
                              width: '100%',
                              background: '#2b2b3d',
                              border: '1px solid #3c3c52',
                              color: '#ffffff',
                              padding: '8px',
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            View Order & Doorstep Trial →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SHEET 2: INSTANT DOORSTEP REFUND UPI */}
              {activeSheet === 'upi' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/assets/icons/bank.svg" alt="" style={{ width: 18, height: 18 }} />
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        Doorstep Refund UPI
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: '#252534', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>

                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
                    When you hand back any piece during your 10-minute doorstep trial, the runner marks it returned and our system instantly transfers 100% of the refund to your verified UPI ID within seconds.
                  </p>

                  <form onSubmit={handleSaveUpi} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                        UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        value={tempUpi}
                        onChange={(e) => setTempUpi(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        style={{
                          width: '100%',
                          background: '#111118',
                          border: '1.5px solid #2e2e42',
                          borderRadius: 12,
                          padding: '12px 14px',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 600,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 10 }}>
                      <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                        Supported on GPay, PhonePe, Paytm & all Indian banking apps
                      </span>
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: 'linear-gradient(135deg, #4f67ff, #6366f1)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 14,
                        padding: '12px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginTop: 4
                      }}
                    >
                      Verify & Save UPI ID
                    </button>
                  </form>
                </div>
              )}

              {/* SHEET 3: NOTIFICATION PREFERENCES */}
              {activeSheet === 'notifications' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/assets/icons/bell.svg" alt="" style={{ width: 18, height: 18 }} />
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        Notifications
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: '#252534', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>

                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
                    Manage how you receive real-time rider tracking and doorstep delivery PINs.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* WhatsApp Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1d1d29', borderRadius: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>WhatsApp Live Rider Tracking</div>
                        <div style={{ fontSize: 11, color: '#888898' }}>Receive live rider location & ETA updates</div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, whatsappOrder: !prev.whatsappOrder }))}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 99,
                          background: notifications.whatsappOrder ? '#25d366' : '#333344',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: 3,
                            left: notifications.whatsappOrder ? 23 : 3,
                            transition: 'all 0.2s ease'
                          }}
                        />
                      </button>
                    </div>

                    {/* SMS OTP Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1d1d29', borderRadius: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>SMS Delivery PIN & Alerts</div>
                        <div style={{ fontSize: 11, color: '#888898' }}>Essential 4-digit doorstep verification PIN</div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, smsOtp: !prev.smsOtp }))}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 99,
                          background: notifications.smsOtp ? '#4f67ff' : '#333344',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: 3,
                            left: notifications.smsOtp ? 23 : 3,
                            transition: 'all 0.2s ease'
                          }}
                        />
                      </button>
                    </div>

                    {/* Flash Drop Alerts */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1d1d29', borderRadius: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Exclusive Flash Drops</div>
                        <div style={{ fontSize: 11, color: '#888898' }}>Early VIP access to limited streetwear drops</div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, flashDrops: !prev.flashDrops }))}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 99,
                          background: notifications.flashDrops ? '#ec4899' : '#333344',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: 3,
                            left: notifications.flashDrops ? 23 : 3,
                            transition: 'all 0.2s ease'
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSheet(null);
                      showToast('Notification settings saved!');
                    }}
                    style={{
                      width: '100%',
                      background: '#4f67ff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 14,
                      padding: '12px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: 18
                    }}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* SHEET 4: DROBE 4-POINT GUARANTEES */}
              {activeSheet === 'guarantees' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/assets/icons/how_it_works_return_instantly.svg" alt="" style={{ width: 18, height: 18 }} />
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        The Drobe Promise
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: '#252534', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                    {/* 1. 60-Min Delivery */}
                    <div style={{ padding: '12px', background: '#1d1d29', borderRadius: 12, border: '1px solid #28283a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>⚡</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#00e676' }}>60-Minute Fast Delivery</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                        Dispatched from our local Ahmedabad & Mumbai micro-fulfillment darkstores in under 7 minutes.
                      </p>
                    </div>

                    {/* 2. Physical Try-On */}
                    <div style={{ padding: '12px', background: '#1d1d29', borderRadius: 12, border: '1px solid #28283a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>👕</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>10-Minute Physical Try-On</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                        Our rider waits outside your doorstep for 10 minutes while you try your fits in total comfort and privacy.
                      </p>
                    </div>

                    {/* 3. Instant Return */}
                    <div style={{ padding: '12px', background: '#1d1d29', borderRadius: 12, border: '1px solid #28283a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>🔄</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#ec4899' }}>Instant Doorstep Returns</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                        Didn&apos;t like the fit? Hand it back on the spot. Zero courier packing, zero return shipping fees, instant UPI refund.
                      </p>
                    </div>

                    {/* 4. 100% Genuine */}
                    <div style={{ padding: '12px', background: '#1d1d29', borderRadius: 12, border: '1px solid #28283a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>🛡️</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>100% Genuine Direct-from-Brand</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                        All apparel, footwear, and accessories are sourced directly from verified authorized brand manufacturers.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveSheet(null)}
                    style={{
                      width: '100%',
                      background: '#2e2e42',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '11px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: 16
                    }}
                  >
                    Got It
                  </button>
                </div>
              )}

              {/* SHEET 5: EDIT PROFILE */}
              {activeSheet === 'editProfile' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Edit Profile
                    </h3>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{ background: '#252534', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#111118',
                          border: '1.5px solid #2e2e42',
                          borderRadius: 12,
                          padding: '12px 14px',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 600,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user?.phone || '+91 98765 43210'}
                        style={{
                          width: '100%',
                          background: '#0d0d14',
                          border: '1px solid #20202e',
                          borderRadius: 12,
                          padding: '12px 14px',
                          color: '#71717a',
                          fontSize: 14,
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ fontSize: 10, color: '#71717a', marginTop: 4, display: 'block' }}>
                        Linked to verified OTP
                      </span>
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: 'linear-gradient(135deg, #4f67ff, #6366f1)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 14,
                        padding: '12px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginTop: 4
                      }}
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          TOAST NOTIFICATION FEEDBACK
          ======================================================== */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 85,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 15, 24, 0.95)',
            border: '1px solid #4f67ff',
            boxShadow: '0 8px 24px rgba(79, 103, 255, 0.3)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: 9999,
            zIndex: 120,
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
