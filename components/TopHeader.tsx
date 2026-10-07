'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopHeader() {
  const { gender, setGender, location, setIsLocationOpen, setIsAuthOpen, wishlist, user } = useApp();
  const router = useRouter();

  const searchPlaceholders = [
    "Search 'Baggy jeans'",
    "Search 'Retro sneakers'",
    "Search 'Oversized tees'",
    "Search 'Corduroy shirts'",
    "Search 'Ethnic kurtas'"
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [searchPlaceholders.length]);

  return (
    <header
      style={{
        padding: '12px 14px 4px',
        background: "url('/assets/real/hero_slice_01_header.webp') top center / 100% 100% no-repeat, #26041d",
        position: 'relative',
        zIndex: 50
      }}
    >
      {/* Row 1: 60 minutes, Location, Try-On Badge, Wishlist, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {/* Left: 60 Minutes Delivery & Location dropdown */}
        <div
          onClick={() => setIsLocationOpen(true)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                color: gender === 'women' ? '#ff5768' : '#38bdf8',
                fontSize: 19.5,
                fontWeight: 900,
                letterSpacing: -0.3,
                fontFamily: 'Satoshi, sans-serif',
                transition: 'color 0.25s ease'
              }}
            >
              60 minutes
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <span
              style={{
                color: '#cccccc',
                fontSize: 12,
                fontWeight: 500,
                maxWidth: 150,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {location.includes('Shreepal') ? 'Shreepal Complex, Sur...' : location}
            </span>
            <img src="/assets/icons/chev-down.svg" alt="" style={{ width: 10, height: 10, opacity: 0.8 }} />
          </div>
        </div>

        {/* Right Actions: Try-On Badge, Wishlist, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Try On! Badge (Official Knot image) */}
          <Link
            href="/try_on"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <img
              src="/assets/images/home_try_on_figma_4x.png"
              alt="Try On!"
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Wishlist Heart Icon */}
          <button
            onClick={() => router.push('/cart')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            <img
              src="/assets/icons/heart_outline.svg"
              alt="Wishlist"
              style={{ width: 22, height: 22 }}
            />
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => router.push('/profile')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            <img
              src="/assets/icons/profile_outline.svg"
              alt="Profile"
              style={{ width: 22, height: 22 }}
            />
          </button>
        </div>
      </div>

      {/* Row 2: Gender Toggle Pill & Search Bar (Exact 1:1 match to Knot) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Gender Toggle Pill */}
        <div
          id="gender-toggle-button"
          onClick={() => setGender(gender === 'men' ? 'women' : 'men')}
          style={{
            background: '#272727',
            border: gender === 'men' ? '1.5px solid #2563eb' : '1.5px solid #ef4444',
            borderRadius: 9999,
            padding: '2.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            height: 44,
            width: 136,
            boxSizing: 'border-box',
            flexShrink: 0,
            transition: 'border-color 0.25s ease'
          }}
        >
          {gender === 'men' ? (
            <>
              {/* Active Men Inner Capsule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '0 12px 0 2px',
                  background: '#202a3a',
                  border: '1.5px solid #2563eb',
                  borderRadius: 9999,
                  height: 36,
                  width: 90,
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
              >
                <img
                  src="/assets/images/knot_avatar_men_clean.png"
                  alt="Men"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Satoshi, sans-serif',
                    letterSpacing: -0.2
                  }}
                >
                  Men
                </span>
              </div>
              {/* Inactive Women Letter */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: 'Satoshi, sans-serif'
                  }}
                >
                  W
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Inactive Men Letter */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: 'Satoshi, sans-serif'
                  }}
                >
                  M
                </span>
              </div>
              {/* Active Women Inner Capsule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '0 2px 0 12px',
                  background: '#3d1d23',
                  border: '1.5px solid #ef4444',
                  borderRadius: 9999,
                  height: 36,
                  width: 94,
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: 'Satoshi, sans-serif',
                    letterSpacing: -0.2
                  }}
                >
                  Women
                </span>
                <img
                  src="/assets/images/knot_avatar_women_clean.png"
                  alt="Women"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    flexShrink: 0
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div
          onClick={() => router.push('/search')}
          style={{
            flex: 1,
            background: '#1b1c23',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            height: 44,
            boxSizing: 'border-box'
          }}
        >
          {/* Magnifying Glass Icon */}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.85, flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>

          <div style={{ flex: 1, overflow: 'hidden', height: 20, position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={placeholderIndex}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  color: '#8e8e93',
                  fontSize: 14.5,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: -0.2
                }}
              >
                {searchPlaceholders[placeholderIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
