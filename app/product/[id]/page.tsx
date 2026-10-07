'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS, Product } from '@/data/catalog';
import MEN_CURATED_SECTIONS from '@/data/men_curated_sections.json';
import confetti from 'canvas-confetti';
import TryAndBuySlider from '@/components/TryAndBuySlider';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cart, addToCart, wishlist, toggleWishlist } = useApp();

  const productId = params?.id as string;
  const curatedProduct = (MEN_CURATED_SECTIONS as any[])
    .flatMap((s: any) => s.products)
    .find((p: any) => p.id === productId);

  const product = curatedProduct || PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

  const thumbnails = product.images.length > 0 ? product.images : [product.thumbnail];
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('S');
  const [activeTab, setActiveTab] = useState<'specification' | 'description'>('specification');
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [selectedStyleCategory, setSelectedStyleCategory] = useState('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [heartPopping, setHeartPopping] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Paired products for "Style it with" strictly adhering to product.gender
  const menStyleProducts = [
    {
      id: 'style_1',
      brand: 'Veirdo',
      title: 'Forest Green Baggy Joggers for Men',
      price: 742,
      originalPrice: 2499,
      discount: '70% off',
      badge: 'EXTRA ₹999 OFF',
      image: '/assets/real/sections/15_sports_unleashed_4.webp'
    },
    {
      id: 'style_2',
      brand: 'JOKER & WITCH',
      title: "JOKER & WITCH Black Rose Gold Men's Watch",
      price: 2733,
      originalPrice: 4899,
      discount: '44% off',
      badge: 'EXTRA ₹999 OFF',
      image: '/assets/real/sections/15_accesories_10.webp'
    }
  ];

  const womenStyleProducts = [
    {
      id: 'style_w_1',
      brand: 'GIVA',
      title: '925 Silver Classic Zircon Pearl Drop Earrings',
      price: 1299,
      originalPrice: 2499,
      discount: '48% off',
      badge: 'EXTRA ₹999 OFF',
      image: '/assets/real/cat_women_sub_jewellery.webp'
    },
    {
      id: 'style_w_2',
      brand: 'Chumbak',
      title: 'Boho Chic Classic Analog Wrist Watch',
      price: 1895,
      originalPrice: 2995,
      discount: '37% off',
      badge: 'EXTRA ₹999 OFF',
      image: '/assets/real/cat_women_footwear_card.png'
    }
  ];

  const styleItWithProducts = product.gender === 'women' ? womenStyleProducts : menStyleProducts;

  // Similar products for bottom grid strictly matching product.gender
  const similarProducts = PRODUCTS.filter((p) => p.gender === product.gender && p.id !== product.id).slice(0, 4);

  const handleSliderCommit = (direction: 'buy' | 'add') => {
    addToCart(product, selectedSize, 'tryAndBuy');

    if (direction === 'buy') {
      setActionFeedback('Proceeding to Checkout...');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => router.push('/cart'), 600);
    } else {
      setActionFeedback('Added to Bag with Free Try & Buy!');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.85 } });
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const handleHeartToggle = () => {
    setHeartPopping(true);
    toggleWishlist(product.id);
    setTimeout(() => setHeartPopping(false), 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.brand} - ${product.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setActionFeedback('Link copied to clipboard!');
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0e0e11', overflow: 'hidden' }}>
      {/* ========================================================
          1. TOP NAVIGATION BAR (Exact 1:1 match)
          Back Arrow + Blue K Monogram Logo + Search + Heart + Bag
          ======================================================== */}
      <header
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0e0e11',
          zIndex: 40
        }}
      >
        {/* Left: Back Arrow + KNOT Stylized Monogram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img
              src="/assets/images/knot-mono.png"
              alt="KNOT"
              style={{ height: 26, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/knot-logo.webp';
              }}
            />
          </Link>
        </div>

        {/* Right: Search + Wishlist + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link href="/search" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          <button
            onClick={handleHeartToggle}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={isWishlisted ? '#ff2a85' : 'none'}
              stroke={isWishlisted ? '#ff2a85' : '#ffffff'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <Link
            href="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalCartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -7,
                  background: '#ff2a85',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {totalCartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ========================================================
          SCROLLABLE PRODUCT DETAILS BODY
          ======================================================== */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 100px' }}>
        {/* ========================================================
            2. MAIN HERO IMAGE CARD (Exact 1:1 Knot Layout)
            - Rounded container
            - Top-Left: TRY 'n BUY frosted pill
            - Top-Right: EXTRA ₹999 OFF magenta pill
            - Bottom-Left: [⛶] TRY ON pill
            - Bottom-Right: Stacked Heart & Share squircle buttons
            ======================================================== */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#16161a',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}
        >
          <img
            src={thumbnails[activeThumbIndex] || product.thumbnail}
            alt={product.title}
            style={{
              width: '100%',
              aspectRatio: '1 / 1.25',
              display: 'block',
              objectFit: 'cover'
            }}
          />

          {/* Top-Left: TRY 'n BUY Frosted Pill Badge */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              padding: '4px 10px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              zIndex: 2,
              userSelect: 'none'
            }}
          >
            <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1 }}>
              TRY
            </span>
            <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1 }}>
              &apos;n BUY
            </span>
          </div>

          {/* Top-Right: EXTRA ₹999 OFF Magenta Badge */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: '#8b1556',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 800,
              padding: '4px 9px',
              borderRadius: 6,
              letterSpacing: '0.02em',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(139, 21, 86, 0.5)'
            }}
          >
            EXTRA ₹999 OFF
          </div>

          {/* Bottom-Left: [⛶] TRY ON Pill Badge */}
          <Link
            href={`/try_on?product=${product.id}`}
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '5px 12px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              zIndex: 2
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
            </svg>
            <span style={{ color: '#5D71F9', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em' }}>
              TRY ON
            </span>
          </Link>

          {/* Bottom-Right: Stacked Floating Action Buttons (Heart & Share) */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              zIndex: 3
            }}
          >
            {/* Heart Button */}
            <motion.button
              onClick={handleHeartToggle}
              whileTap={{ scale: 0.85 }}
              animate={heartPopping ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(38, 38, 44, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
              aria-label="Wishlist"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isWishlisted ? '#ff2a85' : 'none'}
                stroke={isWishlisted ? '#ff2a85' : '#ffffff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(38, 38, 44, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
              aria-label="Share"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>

        {/* ========================================================
            3. THUMBNAIL GALLERY RAIL (Exact Match to Knot Screenshot #2)
            ======================================================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 14,
              background: '#15161a',
              border: '1px solid #22222a',
              overflowX: 'auto',
              maxWidth: '100%',
              scrollbarWidth: 'none'
            }}
          >
            {thumbnails.map((thumb, idx) => {
              const isSelected = activeThumbIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveThumbIndex(idx)}
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: isSelected ? '2px solid #f59e0b' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: '#1c1c24'
                  }}
                >
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            4. PRODUCT BRAND & PRICE (Brand on Left, Price on Right)
            ======================================================== */}
        <div style={{ marginTop: 16, padding: '0 4px' }}>
          {/* Top row: SPYKAR on left, ₹1,203 on right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {product.brand}
            </h2>

            <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Second row: Product title */}
          <h1
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#a1a1aa',
              margin: '6px 0 0',
              lineHeight: 1.4
            }}
          >
            {product.title}
          </h1>

          {/* Third row: Pricing detail with MRP & discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: 14, color: '#71717a', textDecoration: 'line-through' }}>
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 6px',
                borderRadius: 4
              }}
            >
              {product.discountPercentage}% OFF
            </span>
          </div>
        </div>

        {/* ========================================================
            5. SIZE SELECTION (Cards with 60 mins badge + 2 left)
            ======================================================== */}
        <div style={{ marginTop: 22, padding: '0 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>Size</span>
            <button
              onClick={() => setActionFeedback('Standard Size Chart: S(38), M(40), L(42), XL(44)')}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#a1a1aa',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              size chart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {(product.sizes || ['S', 'M', 'L', 'XL']).map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      width: 58,
                      height: 66,
                      borderRadius: 14,
                      background: '#1a1b20',
                      color: '#ffffff',
                      border: isSelected ? '1.5px solid #ffffff' : '1px solid #2a2a32',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#8e8e93',
                        background: '#131417',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}
                    >
                      60 mins
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, paddingBottom: 2 }}>{sz}</span>
                  </button>
                  {sz === 'M' && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', marginTop: 6 }}>
                      2 left
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            6. AUTHENTIC "TRY 'n BUY" HOME TRIAL GRAPHIC BANNER
            ======================================================== */}
        <div style={{ marginTop: 22 }}>
          <img
            src="/assets/real/try_and_buy_pdp_banner.webp"
            alt="TRY 'n BUY Home Trial"
            style={{
              width: '100%',
              borderRadius: 14,
              display: 'block',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
            }}
          />
        </div>

        {/* ========================================================
            7. 4 FEATURE VALUE CARDS (Hanger, 7-Day, Cash, Genuine)
            ======================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginTop: 18
          }}
        >
          {/* Card 1: TRY 'n BUY */}
          <div
            style={{
              background: '#1a1a20',
              borderRadius: 14,
              padding: '14px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
              border: '1px solid #24242c'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5D71F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3c0 1.25.75 2.3 1.83 2.75L2 14.5A2 2 0 0 0 3.5 17h17a2 2 0 0 0 1.5-2.5l-8.83-6.75A3 3 0 0 0 12 2z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              TRY<br />&apos;n BUY
            </span>
          </div>

          {/* Card 2: 7 Day Return */}
          <div
            style={{
              background: '#1a1a20',
              borderRadius: 14,
              padding: '14px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
              border: '1px solid #24242c'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5D71F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              7 Day<br />Return
            </span>
          </div>

          {/* Card 3: Cash on Delivery */}
          <div
            style={{
              background: '#1a1a20',
              borderRadius: 14,
              padding: '14px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
              border: '1px solid #24242c'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5D71F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              Cash on<br />Delivery
            </span>
          </div>

          {/* Card 4: Genuine Product */}
          <div
            style={{
              background: '#1a1a20',
              borderRadius: 14,
              padding: '14px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
              border: '1px solid #24242c'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5D71F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              Genuine<br />Product
            </span>
          </div>
        </div>

        {/* ========================================================
            8. DELIVERY LOCATION & STATUS CARD
            ======================================================== */}
        <div
          style={{
            background: '#1a1a20',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            border: '1px solid #24242c'
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#24242e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="#888898">
              <path d="M9.5 0L2 9.5H8L6.5 16L14 6.5H8L9.5 0Z" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#00e676' }}>
              60 mins delivery available
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
              Andheri East • 400093{' '}
              <span
                onClick={() => setActionFeedback('Location selector opened')}
                style={{ color: '#4F67FF', fontSize: 13, fontWeight: 600, marginLeft: 6, cursor: 'pointer' }}
              >
                Change
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            9. SPECIFICATION & DESCRIPTION TABS CARD
            ======================================================== */}
        <div
          style={{
            background: '#1a1a20',
            borderRadius: 16,
            padding: '18px 16px',
            marginTop: 16,
            border: '1px solid #24242c'
          }}
        >
          {/* Tab Headers */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              borderBottom: '1px solid #272732',
              paddingBottom: 10
            }}
          >
            <button
              onClick={() => setActiveTab('specification')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 6px 0',
                fontSize: 13,
                fontWeight: 700,
                color: activeTab === 'specification' ? '#ffffff' : '#71717a',
                borderBottom: activeTab === 'specification' ? '2.5px solid #ffffff' : 'none',
                cursor: 'pointer'
              }}
            >
              SPECIFICATION
            </button>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 6px 0',
                fontSize: 13,
                fontWeight: 700,
                color: activeTab === 'description' ? '#ffffff' : '#71717a',
                borderBottom: activeTab === 'description' ? '2.5px solid #ffffff' : 'none',
                cursor: 'pointer'
              }}
            >
              DESCRIPTION
            </button>
          </div>

          {activeTab === 'specification' ? (
            <div>
              {/* 2x2 Grid of attributes */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px 20px',
                  marginTop: 16
                }}
              >
                <div>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Primary Color</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                    {product.id === '12886' ? 'Olive Green' : 'Black'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Shade</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                    Muted
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Fabric</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                    {product.fabric || 'Cotton'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Parent Occasion</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                    Daily, Travel & Outdoor, Work
                  </div>
                </div>
              </div>

              {showAllSpecs && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px 20px',
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #272732'
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, color: '#71717a' }}>Fit</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                      {product.fit || 'Regular Fit'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: '#71717a' }}>Pattern</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                      Printed / Graphic
                    </div>
                  </div>
                </div>
              )}

              {/* View more toggle */}
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button
                  onClick={() => setShowAllSpecs(!showAllSpecs)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {showAllSpecs ? 'View less ⌃' : 'View more ⌵'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}>
                {product.description || "Crafted with premium materials to ensure high durability and maximum comfort for everyday wear."}
              </p>
            </div>
          )}
        </div>

        {/* ========================================================
            10. "Style it with" SECTION (Image 4)
            ======================================================== */}
        <div style={{ marginTop: 28, padding: '0 4px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
            Style it with
          </h2>

          {/* Filter Chips */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: 10
            }}
          >
            {['All', 'Pants & Trousers', 'Jeans', 'Belts', 'Footwear'].map((cat) => {
              const isSelected = selectedStyleCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedStyleCategory(cat)}
                  style={{
                    flexShrink: 0,
                    background: isSelected ? '#2a2a34' : '#1c1c22',
                    border: isSelected ? '1px solid #4f67ff' : '1px solid #282830',
                    color: isSelected ? '#ffffff' : '#a1a1aa',
                    padding: '8px 14px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 2 Paired Cards */}
          <div
            style={{
              background: '#16161b',
              borderRadius: 18,
              padding: 12,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              border: '1px solid #22222a',
              marginTop: 6
            }}
          >
            {styleItWithProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#202026',
                  borderRadius: 14,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.15', background: '#18181f' }}>
                  <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      background: '#8b1556',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    {p.badge}
                  </div>
                </div>

                <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>{p.brand}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#a1a1aa',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: 2
                    }}
                  >
                    {p.title}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>₹{p.price}</span>
                    <span style={{ fontSize: 11, color: '#71717a', textDecoration: 'line-through' }}>₹{p.originalPrice}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>{p.discount}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <span style={{ color: '#00e676', fontSize: 11 }}>⚡</span>
                    <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 500 }}>60 mins delivery</span>
                  </div>

                  <button
                    onClick={() => {
                      setActionFeedback(`Added ${p.brand} item to bag!`);
                      confetti({ particleCount: 30, spread: 40, origin: { y: 0.85 } });
                      setTimeout(() => setActionFeedback(null), 2000);
                    }}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      background: '#2b2b35',
                      border: '1px solid #3d3d4a',
                      color: '#ffffff',
                      padding: '8px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            11. "Similar Products" SECTION (Image 4)
            ======================================================== */}
        <div style={{ marginTop: 28, padding: '0 4px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 14 }}>
            Similar Products
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlist.includes(p.id)}
                onToggleWishlist={() => toggleWishlist(p.id)}
                onClick={() => router.push(`/product/${p.id}`)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div
          style={{
            position: 'fixed',
            bottom: 85,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.92)',
            border: '1px solid #6678ff',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '8px 18px',
            borderRadius: 20,
            zIndex: 60
          }}
        >
          {actionFeedback}
        </div>
      )}

      {/* ========================================================
          12. DOCKED BOTTOM SLIDER BAR (With Yellow T-Shirt Knob)
          ======================================================== */}
      <TryAndBuySlider
        onBuyNow={() => handleSliderCommit('buy')}
        onAddToBag={() => handleSliderCommit('add')}
      />
    </div>
  );
}
