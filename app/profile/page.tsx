'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser, setIsAuthOpen, setIsLocationOpen } = useApp();

  const menuItems = [
    { label: 'My Orders & Trials', icon: '/assets/icons/box_ver2.svg', href: '/cart' },
    { label: 'Saved Addresses', icon: '/assets/icons/pin_marker_outline_v3.svg', action: () => setIsLocationOpen(true) },
    { label: 'AI Try-On Saved Fits', icon: '/assets/icons/create_tryon_dark.svg', href: '/try_on' },
    { label: 'Doorstep Refund Bank Account', icon: '/assets/icons/bank.svg', action: () => alert('Instant Refund: Bank account / UPI verified for 10-min doorstep refunds.') },
    { label: 'Notification Settings', icon: '/assets/icons/bell.svg', action: () => alert('WhatsApp & SMS order status notifications are active.') },
    { label: '7-Days Return Policy', icon: '/assets/icons/7_days_return.svg', action: () => alert('Knot 7-Days Easy Return Policy: Return within 7 days for a 100% full refund.') },
    { label: 'WhatsApp Live Support', icon: '/assets/icons/icon_whatsapp_contact_us.svg', href: 'https://wa.me/919876543210' }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#171717', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          padding: '14px 16px',
          background: '#171717',
          borderBottom: '1px solid #242424',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>My Account</h1>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {!user ? (
          /* Guest Profile State */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#202029',
                border: '1px solid #2e2e3c',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}
            >
              <img
                src="/assets/images/welcome_image_dark.webp"
                alt="Welcome to KNOT"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <div style={{ padding: '16px' }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Welcome to KNOT</h2>
                <p style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: '17px' }}>
                  Sign in with your mobile number to view active 60-min orders, doorstep trial history, and redeem ₹250 Knot Cash!
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  style={{
                    width: '100%',
                    background: '#6678ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px',
                    fontSize: 13,
                    fontWeight: 800,
                    marginTop: 14,
                    cursor: 'pointer'
                  }}
                >
                  Log In / Sign Up
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In User Card */
          <>
            <div
              style={{
                background: '#20202a',
                border: '1px solid #2e2e3c',
                borderRadius: 20,
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 16
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6678ff, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#fff'
                }}
              >
                {user.name?.[0] || 'K'}
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                  {user.name}
                </h2>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {user.phone}
                </p>
              </div>

              <button
                onClick={logoutUser}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4
                }}
                title="Log Out"
              >
                <img src="/assets/icons/logout.svg" alt="Logout" style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Knot Cash Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #18283a 0%, #151a24 100%)',
                border: '1px solid #243c58',
                borderRadius: 18,
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Knot Cash Wallet
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  ₹{user.knotCash}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                  Usable automatically on next checkout
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(56,189,248,0.15)',
                  border: '1px solid #38bdf8',
                  borderRadius: 12,
                  padding: '6px 12px',
                  color: '#38bdf8',
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                ACTIVE
              </div>
            </div>
          </>
        )}

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {menuItems.map((item) => {
            const content = (
              <div
                key={item.label}
                onClick={item.action}
                style={{
                  background: '#202029',
                  border: '1px solid #2b2b38',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={item.icon} alt="" style={{ width: 18, height: 18, opacity: 0.8 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ddd' }}>{item.label}</span>
                </div>
                <img src="/assets/icons/right.svg" alt="" style={{ width: 12, height: 12, opacity: 0.5 }} />
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                  {content}
                </Link>
              );
            }
            return content;
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
