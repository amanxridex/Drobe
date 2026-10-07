'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS } from '@/data/catalog';
import ProductCard from '@/components/ProductCard';
import BottomNav from '@/components/BottomNav';

export default function SearchPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist, gender } = useApp();
  const [query, setQuery] = useState('');
  const [activeGenderFilter, setActiveGenderFilter] = useState<'all' | 'men' | 'women'>(gender);

  React.useEffect(() => {
    setActiveGenderFilter(gender);
  }, [gender]);

  // Authentic Knot popular search suggestions branch on Gender
  const menPopularSearches = [
    'Relaxed Joggers',
    'Retro Varsity',
    'Street Shorts',
    'Chinos',
    'Tailored trousers',
    'Oversized',
    'Urban Blazers'
  ];

  const womenPopularSearches = [
    'Anarkali Kurta',
    'Floral Dresses',
    'Wide Leg Denims',
    'Corset Tops',
    'Silk Sarees',
    'Co-ord Sets',
    'Party Heels'
  ];

  const popularSearches = activeGenderFilter === 'women' || (activeGenderFilter === 'all' && gender === 'women')
    ? womenPopularSearches
    : menPopularSearches;

  const placeholderText = activeGenderFilter === 'women' || (activeGenderFilter === 'all' && gender === 'women')
    ? "Search for 'Floral dresses'"
    : "Search for 'Baggy jeans'";

  // Real-time search results matching catalog with multi-word intelligence
  const searchResults = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase().trim();
        const searchTerms = [q, ...q.split(/\s+/).filter((w) => w.length > 2)];
        const textToSearch = [
          p.title,
          p.brand,
          p.category,
          p.subCategory,
          p.fabric || '',
          p.fit || '',
          p.gender
        ]
          .join(' ')
          .toLowerCase();

        const matchesQuery = searchTerms.some((term) => textToSearch.includes(term));
        if (!matchesQuery) return false;
        if (activeGenderFilter === 'men') return p.gender === 'men';
        if (activeGenderFilter === 'women') return p.gender === 'women';
        return true;
      })
    : [];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#171717',
        color: '#ffffff',
        overflow: 'hidden',
        fontFamily: 'Satoshi, sans-serif'
      }}
    >
      {/* ========================================================
          SEARCH HEADER (EXACT 1:1 MATCH TO KNOT)
          Single pill container with inside back arrow,
          input field, and clear button
          ======================================================== */}
      <header
        style={{
          padding: '10px 16px',
          background: '#171717',
          borderBottom: '1px solid #232325',
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: '100%',
            height: 44,
            background: '#202022',
            border: '1px solid #2d2d30',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
            boxSizing: 'border-box'
          }}
        >
          {/* Back Chevron `<` inside the pill */}
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              flexShrink: 0
            }}
            aria-label="Back"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Search Input Field */}
          <input
            type="text"
            placeholder={placeholderText}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Satoshi, sans-serif',
              letterSpacing: -0.2
            }}
          />

          {/* Clear button when text entered */}
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#8e8e93',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                flexShrink: 0
              }}
              aria-label="Clear"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          BODY: EXACT KNOT POPULAR SEARCHES vs SEARCH RESULTS
          ======================================================== */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        {/* Popular Searches Section (Always accessible or at top) */}
        {query.trim() === '' ? (
          <div>
            {/* Heading */}
            <div style={{ padding: '20px 16px 14px' }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: 'Satoshi, sans-serif',
                  letterSpacing: -0.2,
                  margin: 0
                }}
              >
                Popular searches
              </h2>
            </div>

            {/* Horizontal Scrolling Chips Row */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                padding: '0 16px 20px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    background: '#202022',
                    border: '1px solid #2d2d32',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Magnifying Glass Icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8e8e93"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: '#d4d4d8',
                      fontFamily: 'Satoshi, sans-serif',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          /* ========================================================
             EMPTY RESULTS STATE
             ======================================================== */
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#202024',
                border: '1px solid #2d2d35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                color: '#71717a'
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 8, letterSpacing: -0.2 }}>
              No results found for "{query}"
            </h3>
            <p style={{ fontSize: 13, color: '#8e8e93', maxWidth: 280, margin: '0 auto 24px', lineHeight: 1.4 }}>
              Try searching for something else or explore our most popular trends below
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {popularSearches.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    background: '#202022',
                    border: '1px solid #2f2f35',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    color: '#e5e7eb',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================
             ACTIVE SEARCH RESULTS (2-COLUMN PRODUCT GRID)
             ======================================================== */
          <div style={{ padding: '16px 16px 80px' }}>
            {/* Filter and Count Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
                gap: 8
              }}
            >
              <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
                {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'} found
              </div>

              {/* Gender Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: '#202022',
                  border: '1px solid #2d2d32',
                  borderRadius: 9999,
                  padding: 2
                }}
              >
                {(['all', 'men', 'women'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setActiveGenderFilter(g)}
                    style={{
                      background: activeGenderFilter === g ? '#323238' : 'transparent',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '4px 12px',
                      color: activeGenderFilter === g ? '#ffffff' : '#8e8e93',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {searchResults.map((p) => (
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
        )}
      </main>

      <BottomNav />
    </div>
  );
}
