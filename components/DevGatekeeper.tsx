'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function DevGatekeeper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState<number>(0);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Bypassed management routes (admin, brand dashboard, portal, etc.)
  const isBypassedRoute =
    pathname?.startsWith('/admin-dashboard') ||
    pathname?.startsWith('/brand-dashboard') ||
    pathname?.startsWith('/platform-changes') ||
    pathname?.startsWith('/order-portal') ||
    pathname?.startsWith('/delivery-partner');

  const enableDev = () => {
    try {
      localStorage.setItem('drobe_dev_mode', 'true');
      sessionStorage.setItem('drobe_dev_mode', 'true');
      document.cookie = 'drobe_dev_mode=true; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) {}
    setIsDevMode(true);
    setShowPinModal(false);
    setPinError('');
  };

  const disableDev = () => {
    try {
      localStorage.removeItem('drobe_dev_mode');
      sessionStorage.removeItem('drobe_dev_mode');
      document.cookie = 'drobe_dev_mode=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {}
    setIsDevMode(false);
    setShowPinModal(false);
  };

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    // 1. Check URL parameters for developer bypass
    const params = new URLSearchParams(window.location.search);
    const hasDevParam =
      params.get('dev') === 'true' ||
      params.get('dev') === '1' ||
      params.get('preview') === 'true' ||
      params.get('admin') === 'true' ||
      params.get('access') === 'drobe' ||
      params.get('secret') === 'drobe' ||
      params.get('pass') === 'drobe' ||
      params.has('drobe');

    const hasLockParam = params.get('dev') === 'false' || params.get('lock') === 'true';

    if (hasLockParam) {
      disableDev();
      return;
    }

    if (hasDevParam) {
      enableDev();
      return;
    }

    // 2. Check stored credentials
    try {
      const stored = localStorage.getItem('drobe_dev_mode');
      const session = sessionStorage.getItem('drobe_dev_mode');
      const hasCookie = document.cookie.includes('drobe_dev_mode=true');

      if (stored === 'true' || session === 'true' || hasCookie) {
        setIsDevMode(true);
      }
    } catch (e) {}
  }, []);

  // Handle secret tap gesture on the white DROBE logo
  const handleLogoTap = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    // 5 rapid taps = Instant Developer Unlock without typing PIN
    if (nextCount >= 5) {
      enableDev();
      setTapCount(0);
      return;
    }

    // 3 taps = Open Developer Passcode Dialog
    if (nextCount >= 3) {
      setShowPinModal(true);
      setTapCount(0);
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 1800);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toLowerCase();
    if (cleanPin === 'drobe' || cleanPin === 'drobe.one' || cleanPin === 'admin' || cleanPin === '1234') {
      enableDev();
    } else {
      setPinError('Invalid passcode. Try "drobe"');
    }
  };

  // If bypassed route, render immediately
  if (isBypassedRoute) {
    return <>{children}</>;
  }

  // Developer mode unlocked: render main app with floating developer control badge
  if (isDevMode) {
    return (
      <>
        {children}

        {/* Floating Developer Control Pill */}
        <div
          id="drobe-dev-indicator"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(15, 15, 15, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 30,
            padding: '7px 14px',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>DEV PREVIEW</span>
          </div>

          <button
            onClick={disableDev}
            style={{
              background: '#E5002B',
              border: 'none',
              borderRadius: 16,
              padding: '3px 10px',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => ((e.target as HTMLElement).style.opacity = '0.85')}
            onMouseOut={(e) => ((e.target as HTMLElement).style.opacity = '1')}
            title="Lock screen back to live user red screen"
          >
            LOCK FOR USERS
          </button>
        </div>
      </>
    );
  }

  // Live Red Holding Screen for All Public Users (contained inside the mobile frame)
  return (
    <div
      id="drobe-live-red-screen"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
        flex: 1,
        backgroundColor: '#E5002B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        margin: 0,
        padding: 0
      }}
    >
      {/* Centered White DROBE Logo */}
      <div
        onClick={handleLogoTap}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 30,
          transition: 'transform 0.15s ease'
        }}
        active-tap="true"
        title=""
      >
        <img
          src="/drobe-logo-full-white.png"
          alt="DROBE"
          style={{
            width: 220,
            maxWidth: '68vw',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Discreet Developer Passcode Modal (triggered by 3 taps on logo) */}
      {showPinModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000000,
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPinModal(false);
          }}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 20,
              padding: '24px 28px',
              width: '100%',
              maxWidth: 340,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Developer Access</div>
              <button
                onClick={() => setShowPinModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  fontSize: 18,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 16, lineHeight: 1.4 }}>
              Enter passcode or click bypass to preview the live main application.
            </p>

            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                placeholder="Passcode (hint: drobe)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                autoFocus
                style={{
                  width: '100%',
                  background: '#27272a',
                  border: pinError ? '1px solid #ef4444' : '1px solid #3f3f46',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: 14,
                  outline: 'none',
                  marginBottom: 8
                }}
              />

              {pinError && (
                <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 10 }}>
                  {pinError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#E5002B',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={enableDev}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#e4e4e7',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Bypass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
