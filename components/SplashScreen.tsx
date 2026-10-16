'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function SplashScreen() {
  const pathname = usePathname();
  const { location, userCoords, deliveryMinutes, requestExactLocation, isLocating } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionChoice, setPermissionChoice] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [statusText, setStatusText] = useState('Initializing Ahmedabad Darkstore Hub #01...');

  // Bypassed routes: brand dashboard, admin, and partner portals must NEVER show consumer delivery splash
  const isBypassedRoute =
    pathname?.startsWith('/brand-dashboard') ||
    pathname?.startsWith('/admin-dashboard') ||
    pathname?.startsWith('/order-portal') ||
    pathname?.startsWith('/delivery-partner') ||
    pathname?.startsWith('/platform-changes');

  useEffect(() => {
    if (isBypassedRoute) {
      setShowSplash(false);
      return;
    }

    // Safety failsafe: never keep splash screen visible for more than 2.5s under any condition
    const failsafeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Check if we've already prompted in this browser session
    const hasPrompted = typeof window !== 'undefined' ? sessionStorage.getItem('drobe_splash_shown') : null;
    const storedCoords = typeof window !== 'undefined' ? localStorage.getItem('drobe_user_coords') : null;

    if (hasPrompted && storedCoords) {
      // Returning user in same session: quick 600ms branded entrance
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 650);
      return () => {
        clearTimeout(timer);
        clearTimeout(failsafeTimer);
      };
    }

    // First time launch: show splash and check for location permission
    const promptTimer = setTimeout(() => {
      if ('geolocation' in navigator && !storedCoords) {
        setShowPermissionPrompt(true);
        setStatusText('Awaiting GPS authorization for 30-min delivery...');
      } else {
        // Already has coords or geolocation unavailable
        setTimeout(() => setShowSplash(false), 800);
      }
    }, 1200);

    return () => {
      clearTimeout(promptTimer);
      clearTimeout(failsafeTimer);
    };
  }, [isBypassedRoute]);

  if (isBypassedRoute || !showSplash) return null;

  const handleGrantPermission = async (mode: 'precise' | 'approximate') => {
    setStatusText('Acquiring real-time GPS satellites...');
    setPermissionChoice('granted');

    try {
      const res = await requestExactLocation();
      if (res.success) {
        setStatusText(`✓ Routed to ${res.address?.split(',')[0]} (⚡ ${res.minutes}m express)`);
      } else {
        setStatusText('Using Ahmedabad Central Hub #01 zone');
      }
    } catch (e) {
      setStatusText('Using Ahmedabad Central Hub #01 zone');
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('drobe_splash_shown', 'true');
    }

    setTimeout(() => {
      setShowSplash(false);
    }, 800);
  };

  const handleDenyPermission = () => {
    setPermissionChoice('denied');
    setStatusText('Defaulting to Ahmedabad Central Hub #01 (Motera)');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('drobe_splash_shown', 'true');
    }
    setTimeout(() => {
      setShowSplash(false);
    }, 500);
  };

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="drobe-splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '48px 24px calc(24px + env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Roboto", sans-serif',
          userSelect: 'none'
        }}
      >
        {/* Android Native Subtle Status Bar Header */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            fontWeight: 700,
            color: '#888888',
            letterSpacing: '0.04em'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#ffffff', fontSize: 11 }}>AHMEDABAD HUB #01 LIVE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <span>5G ULTRA</span>
            <span>⚡ 30-MIN</span>
          </div>
        </div>

        {/* Center Animated Logo & Radar Rings */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            width: '100%',
            maxWidth: 360
          }}
        >
          {/* Concentric Pulsing Radar Rings */}
          <div
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.12)',
              pointerEvents: 'none',
              animation: 'spin 18s linear infinite'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 190,
              height: 190,
              borderRadius: '50%',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              pointerEvents: 'none'
            }}
          />

          {/* Chrome Emblem with Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 26,
              background: 'linear-gradient(135deg, #181820 0%, #0d0d12 100%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.25)',
              marginBottom: 20,
              position: 'relative'
            }}
          >
            <img
              src="/drobe-emblem-white.png"
              alt="DROBE"
              style={{ width: 52, height: 52, objectFit: 'contain' }}
            />
          </motion.div>

          {/* DROBE Stylized Wordmark */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <img
              src="/drobe-wordmark-white.png"
              alt="DROBE"
              style={{ height: 26, width: 'auto', objectFit: 'contain', letterSpacing: '0.1em' }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: '#38bdf8',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginTop: 8
              }}
            >
              30-Min Try Before You Buy
            </div>
          </motion.div>

          {/* Real Status Subtitle */}
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 12,
              color: '#9ca3af',
              marginTop: 18,
              textAlign: 'center',
              minHeight: 20
            }}
          >
            {statusText}
          </motion.div>
        </div>

        {/* Bottom Section: Android 14 Material You Styled Permission Dialog or Loading Bar */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          {showPermissionPrompt && permissionChoice === 'prompt' ? (
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                background: '#16161b',
                border: '1px solid #282834',
                borderRadius: 24,
                padding: '20px 18px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
                boxSizing: 'border-box'
              }}
            >
              {/* Permission Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>
                    Allow DROBE to access this device's location?
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, lineHeight: '16px' }}>
                    DROBE calculates real-time express courier routes from Ahmedabad Central Hub #01 to your exact doorstep for 30-min doorstep fitting.
                  </div>
                </div>
              </div>

              {/* Precise Location Indicator Pill */}
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  borderRadius: 12,
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>
                  Precise GPS Tracking Active
                </span>
              </div>

              {/* Action Buttons (Native Android Pill Layout) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => handleGrantPermission('precise')}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    borderRadius: 16,
                    padding: '13px 16px',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255,255,255,0.15)'
                  }}
                >
                  While using the app
                </button>

                <button
                  onClick={() => handleGrantPermission('approximate')}
                  style={{
                    width: '100%',
                    background: '#242430',
                    color: '#ffffff',
                    border: '1px solid #363646',
                    borderRadius: 16,
                    padding: '11px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Only this time
                </button>

                <button
                  onClick={handleDenyPermission}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: '#8e8e93',
                    border: 'none',
                    borderRadius: 16,
                    padding: '9px 16px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Don't allow
                </button>
              </div>
            </motion.div>
          ) : (
            /* Subtle Loading Bar */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: '100%',
                  height: 3,
                  background: '#1a1a24',
                  borderRadius: 99,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  style={{
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)',
                    borderRadius: 99
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: '#666', letterSpacing: '0.05em' }}>
                POWERED BY DROBE EXPRESS OS
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
