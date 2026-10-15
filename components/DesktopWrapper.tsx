'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LocationModal from './LocationModal';
import AuthModal from './AuthModal';
import CouponModal from './CouponModal';

export default function DesktopWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

  if (pathname?.startsWith('/admin-dashboard') || pathname?.startsWith('/order-portal') || pathname?.startsWith('/platform-changes')) {
    return (
      <div
        id="admin-desktop-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#f8fafc',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 9999
        }}
      >
        {children}
      </div>
    );
  }

  if (pathname?.startsWith('/brand-dashboard')) {
    return (
      <div
        id="app-desktop-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: isMobile ? 'var(--app-height, 100dvh)' : '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <div
          id="mobile-app-frame"
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '440px',
            height: isMobile ? 'var(--app-height, 100dvh)' : '100vh',
            backgroundColor: '#ffffff',
            border: isMobile ? 'none' : '1px solid #e2e8f0',
            boxShadow: isMobile ? 'none' : '0 12px 40px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            margin: '0 auto'
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (pathname?.startsWith('/delivery-partner')) {
    return (
      <div
        id="delivery-desktop-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: isMobile ? 'var(--app-height, 100dvh)' : '100vh',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <div
          id="mobile-app-frame"
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '440px',
            height: isMobile ? 'var(--app-height, 100dvh)' : '100vh',
            backgroundColor: '#ffffff',
            border: isMobile ? 'none' : '1px solid #e2e8f0',
            boxShadow: isMobile ? 'none' : '0 12px 40px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            margin: '0 auto'
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      id="app-root-viewport"
      style={{
        width: '100%',
        minHeight: '100vh',
        height: 'var(--app-height, 100dvh)',
        backgroundColor: '#000000',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div
        id="mobile-app-frame"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {children}
        <LocationModal />
        <AuthModal />
        <CouponModal />
      </div>
    </div>
  );
}
