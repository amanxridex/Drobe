'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS, CATEGORIES_DATA } from '@/data/catalog';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { gender, wishlist, toggleWishlist, cart } = useApp();

  const collectionId = params?.id as string;
  const categories = gender === 'men' ? CATEGORIES_DATA.men : CATEGORIES_DATA.women;
  const currentCat = categories.find((c) => c.id === collectionId) || { id: collectionId, name: collectionId ? collectionId.toUpperCase() : 'ALL PRODUCTS' };

  const [sortBy, setSortBy] = useState<'popular' | 'low' | 'high'>('popular');

  // STRICT 100% GENDER ISOLATION: Never leak opposite gender products
  let products = PRODUCTS.filter((p) => {
    if (p.gender !== gender) return false;
    if (!collectionId || collectionId === 'all') return true;
    return p.category.toLowerCase() === collectionId.toLowerCase();
  });

  // If a specific subcategory had zero items, fall back ONLY to products of the same gender
  if (products.length === 0) {
    products = PRODUCTS.filter((p) => p.gender === gender);
  }

  if (sortBy === 'low') {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'high') {
    products = [...products].sort((a, b) => b.price - a.price);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#121214', overflow: 'hidden' }}>
      {/* ========================================================
          1. AUTHENTIC KNOT PLP HEADER
          Back Arrow + Knot Blue Logo | Title | Search + Heart + Bag
          ======================================================== */}
      <header
        style={{
          padding: '12px 16px',
          background: '#121214',
          borderBottom: '1px solid #1f1f23',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40
        }}
      >
        {/* Left: Back Arrow + Knot Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/assets/images/knot-mono.png"
              alt="KNOT"
              style={{ height: 24, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/knot-logo.webp';
              }}
            />
          </Link>
        </div>

        {/* Center Title */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 14.5,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: 'Satoshi, sans-serif'
            }}
          >
            {currentCat.name}
          </h1>
          <p style={{ fontSize: 10.5, color: '#8e8e93', margin: '2px 0 0 0', fontWeight: 500 }}>
            {products.length} Items • 60-min delivery
          </p>
        </div>

        {/* Right: Search, Wishlist, Bag with count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/search" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -7,
                  background: '#6678FF',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  minWidth: 15,
                  height: 15,
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Filter / Sort bar */}
      <div
        style={{
          padding: '8px 16px',
          background: '#161619',
          borderBottom: '1px solid #222227',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}
      >
        <button
          onClick={() => setSortBy(sortBy === 'low' ? 'high' : 'low')}
          style={{
            background: '#222228',
            border: '1px solid #32323c',
            color: '#fff',
            borderRadius: 9999,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <span>↕</span>
          Price: {sortBy === 'low' ? 'Low to High' : 'High to Low'}
        </button>

        <span
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            borderRadius: 9999,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          ⚡ 60-Min Express
        </span>

        <span
          style={{
            background: '#222228',
            border: '1px solid #32323c',
            color: '#a1a1aa',
            borderRadius: 9999,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          Try 'n Buy
        </span>
      </div>

      {/* Product Grid - 2 Column Knot Layout */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '14px 10px 85px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={() => toggleWishlist(product.id)}
              onClick={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
