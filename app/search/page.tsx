'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/catalog';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const trendingTags = [
    'Baggy jeans',
    'Corduroy shirts',
    'Oversized tees',
    'Ethnic kurtas',
    'Retro sneakers',
    'Cargo pants',
    'Chunky loafers'
  ];

  const searchResults = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.subCategory.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#171717', overflow: 'hidden' }}>
      {/* Search Header */}
      <header
        style={{
          padding: '12px 16px',
          background: '#171717',
          borderBottom: '1px solid #242424',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
        </button>

        <div
          style={{
            flex: 1,
            background: '#22222d',
            borderRadius: 24,
            border: '1px solid #363645',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <img src="/assets/icons/search.svg" alt="" style={{ width: 16, height: 16, opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Search clothes, brands, trends..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', padding: 0 }}
            >
              <img src="/assets/icons/cross_close.svg" alt="Clear" style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {query.trim() === '' ? (
          <div>
            {/* Trending Searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Trending Right Now
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    background: '#22222d',
                    border: '1px solid #333342',
                    borderRadius: 16,
                    padding: '8px 14px',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick Explore */}
            <h2 style={{ fontSize: 13, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Popular Picks
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PRODUCTS.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  style={{
                    background: '#202029',
                    border: '1px solid #2d2d3a',
                    borderRadius: 14,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={p.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{p.brand} • ₹{p.price}</div>
                    </div>
                  </div>
                  <img src="/assets/icons/right.svg" alt="" style={{ width: 14, height: 14, opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          /* Authentic Empty Search State */
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ width: 130, height: 130, margin: '0 auto 16px' }}>
              <img src="/assets/icons/empty_search_dark.svg" alt="No matches" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              No results found for "{query}"
            </h3>
            <p style={{ fontSize: 12, color: '#888', maxWidth: 260, margin: '0 auto' }}>
              Try searching for baggy jeans, sneakers or oversized tees
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
              Found {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} for "{query}"
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/product/${p.id}`)}
                  style={{
                    background: '#202029',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid #2e2e3c',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.25', background: '#181820' }}>
                    <img src={p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: 'rgba(0, 0, 0, 0.75)',
                        padding: '2px 6px',
                        borderRadius: 6,
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#38bdf8'
                      }}
                    >
                      ⚡ 60 Mins
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#888', textTransform: 'uppercase' }}>{p.brand}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginTop: 4 }}>₹{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
