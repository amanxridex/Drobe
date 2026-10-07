'use client';

import React, { useState, useEffect } from 'react';
import LocationModal from './LocationModal';
import AuthModal from './AuthModal';
import CouponModal from './CouponModal';

export default function DesktopWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleViewport = () => {
      const mobile = window.innerWidth < 550;
      setIsMobile(mobile);
      if (mobile) {
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${vh}px`);
        document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
      }
    };

    handleViewport();
    window.addEventListener('resize', handleViewport);
    window.addEventListener('orientationchange', handleViewport);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewport);
      window.visualViewport.addEventListener('scroll', handleViewport);
    }

    return () => {
      window.removeEventListener('resize', handleViewport);
      window.removeEventListener('orientationchange', handleViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewport);
        window.visualViewport.removeEventListener('scroll', handleViewport);
      }
    };
  }, []);

  return (
    <div
      id="app-desktop-wrapper"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: isMobile ? 'var(--app-height, 100dvh)' : '100vh',
        backgroundColor: '#242424',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Desktop Left QR Download Card (Exact 1:1 match to Knot desktop) */}
      <div id="qr-download-card">
        <img
          src="/assets/images/desktop_qr_exact.png"
          alt="Download KNOT"
          style={{
            width: '212px',
            display: 'block'
          }}
        />
      </div>

      {/* Main Centered Mobile Application Frame */}
      <div
        id="mobile-app-frame"
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '446px',
          height: isMobile ? 'var(--app-height, 100dvh)' : '100vh',
          backgroundColor: '#171717',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: isMobile ? 'none' : '0 0 50px rgba(0,0,0,0.6)',
          margin: '0 auto'
        }}
      >
        {children}
        <LocationModal />
        <AuthModal />
        <CouponModal />
      </div>

      {/* Desktop Right Social Link (Exact Instagram pill button) */}
      <div id="social-links-card">
        <a
          href="https://www.instagram.com/knotnow.co"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: '#2b2b2b',
            border: '1px solid #383838',
            borderRadius: 22,
            padding: '7px 15px',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <img
            src="/assets/images/insta_social.svg"
            alt=""
            style={{ width: 16, height: 16 }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          Instagram
        </a>
      </div>
    </div>
  );
}
