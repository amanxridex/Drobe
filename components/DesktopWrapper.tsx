'use client';

import React from 'react';
import LocationModal from './LocationModal';
import AuthModal from './AuthModal';
import CouponModal from './CouponModal';

export default function DesktopWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div id="app-desktop-wrapper">
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
      <div id="mobile-app-frame">
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
