'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS } from '@/data/catalog';
import confetti from 'canvas-confetti';
import TryAndBuySlider from '@/components/TryAndBuySlider';
import WishlistButton from '@/components/WishlistButton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cart, addToCart, wishlist, toggleWishlist } = useApp();

  const productId = params?.id as string;
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

  const thumbnails = product.images.length > 0 ? product.images : [product.thumbnail];
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isWishlisted = wishlist.includes(product.id);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#121215', overflow: 'hidden' }}>
      {/* ========================================================
          TOP NAVIGATION BAR (Exact 1:1 match)
          Back Arrow + Knot Monogram Logo + Search + Heart + Bag
          ======================================================== */}
      <header
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#121215',
          borderBottom: '1px solid #202025',
          zIndex: 40
        }}
      >
        {/* Left: Back Arrow + KNOT Monogram */}
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
            <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/search" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/assets/icons/search.svg" alt="Search" style={{ width: 20, height: 20 }} />
          </Link>

          <WishlistButton
            isWishlisted={isWishlisted}
            onToggle={() => toggleWishlist(product.id)}
            size={22}
          />

          <Link
            href="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <img src="/assets/icons/bag_outline.svg" alt="Bag" style={{ width: 22, height: 22 }} />
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
      <main style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 90px' }}>
        {/* Main Product Hero Image Card */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            background: '#1a1a20'
          }}
        >
          <img
            src={thumbnails[activeThumbIndex] || product.thumbnail}
            alt={product.title}
            style={{ width: '100%', maxHeight: 420, display: 'block', objectFit: 'contain', margin: '0 auto' }}
          />

          {/* Floating Try On Shortcut */}
          <Link
            href={`/try_on?product=${product.id}`}
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #3b82f6',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none'
            }}
          >
            <img src="/assets/images/home_try_on_figma_4x.png" alt="" style={{ width: 14, height: 14 }} />
            <span>AI TRY-ON</span>
          </Link>

          {/* Floating Wishlist & Share buttons */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WishlistButton
              isWishlisted={isWishlisted}
              onToggle={() => toggleWishlist(product.id)}
              size={18}
            />
          </div>

          <button
            onClick={handleShare}
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.65)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <img src="/assets/icons/share.svg" alt="Share" style={{ width: 16, height: 16 }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          </button>
        </div>

        {/* Thumbnail Selector Row */}
        {thumbnails.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {thumbnails.map((thumb, idx) => {
              const isSelected = activeThumbIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveThumbIndex(idx)}
                  style={{
                    width: 52,
                    height: 58,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #333340',
                    boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: '#16161d'
                  }}
                >
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        )}

        {/* Delivery Time Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid #38bdf8',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 800,
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>⚡</span> Delivery in {product.deliveryMinutes} Mins
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10b981',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 800,
              color: '#34d399'
            }}
          >
            FREE TRY & BUY
          </div>
        </div>

        {/* Product Brand & Price Row */}
        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#9090a0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {product.brand}
          </span>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginTop: 2, lineHeight: '26px' }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>₹{product.price}</span>
            <span style={{ fontSize: 15, color: '#707080', textDecoration: 'line-through' }}>₹{product.originalPrice}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{product.discountPercentage}% OFF</span>
          </div>
        </div>

        {/* Size Selection */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Select Size</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>Only 2 left in stock</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {product.sizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: isSelected ? '#ffffff' : '#202028',
                    color: isSelected ? '#121215' : '#ffffff',
                    border: isSelected ? '2px solid #ffffff' : '1px solid #333340',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Return Guarantee */}
        <div
          style={{
            marginTop: 20,
            background: '#1b1b24',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: '1px solid #282835'
          }}
        >
          <img src="/assets/icons/7_days_return.svg" alt="Return" style={{ width: 28, height: 28 }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>7 Days Easy Return & Exchange</div>
            <div style={{ fontSize: 11, color: '#9090a0', marginTop: 2 }}>Don’t like the fit? Rider picks it right back up.</div>
          </div>
        </div>

        {/* Product Details Section */}
        <div style={{ marginTop: 20, borderTop: '1px solid #22222c', paddingTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>Product Overview</h3>
          <p style={{ fontSize: 12, color: '#a0a0b0', lineHeight: '18px' }}>{product.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 14 }}>
            <div style={{ background: '#191922', padding: 10, borderRadius: 10 }}>
              <span style={{ fontSize: 10, color: '#707080', fontWeight: 700 }}>FABRIC</span>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 2 }}>{product.fabric}</div>
            </div>
            <div style={{ background: '#191922', padding: 10, borderRadius: 10 }}>
              <span style={{ fontSize: 10, color: '#707080', fontWeight: 700 }}>FIT</span>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 2 }}>{product.fit}</div>
            </div>
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

      <TryAndBuySlider
        onBuyNow={() => handleSliderCommit('buy')}
        onAddToBag={() => handleSliderCommit('add')}
      />
    </div>
  );
}
