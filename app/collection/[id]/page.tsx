'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PRODUCTS, CATEGORIES_DATA } from '@/data/catalog';
import BottomNav from '@/components/BottomNav';
import WishlistButton from '@/components/WishlistButton';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { gender, wishlist, toggleWishlist } = useApp();

  const collectionId = params?.id as string;
  const categories = gender === 'men' ? CATEGORIES_DATA.men : CATEGORIES_DATA.women;
  const currentCat = categories.find((c) => c.id === collectionId) || { id: collectionId, name: 'Curated Collection' };

  const [sortBy, setSortBy] = useState<'popular' | 'low' | 'high'>('popular');

  let products = PRODUCTS.filter((p) => !collectionId || collectionId === 'all' || p.category === collectionId);
  if (products.length === 0) products = PRODUCTS;

  if (sortBy === 'low') {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'high') {
    products = [...products].sort((a, b) => b.price - a.price);
  }

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
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <img src="/assets/icons/back_arrow.svg" alt="Back" style={{ width: 22, height: 22 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{currentCat.name}</h1>
            <p style={{ fontSize: 11, color: '#888' }}>{products.length} Products • 60-min delivery</p>
          </div>
        </div>

        <Link href="/search" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/assets/icons/search.svg" alt="Search" style={{ width: 20, height: 20 }} />
        </Link>
      </header>

      {/* Filter / Sort bar */}
      <div
        style={{
          padding: '10px 16px',
          background: '#1c1c24',
          borderBottom: '1px solid #282834',
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
            background: '#252532',
            border: '1px solid #363646',
            color: '#fff',
            borderRadius: 16,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <img src="/assets/icons/sort.svg" alt="" style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)' }} />
          Price: {sortBy === 'low' ? 'Low to High' : 'High to Low'}
        </button>

        <span
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            borderRadius: 16,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          ⚡ 60-Min Express
        </span>

        <span
          style={{
            background: '#252532',
            border: '1px solid #363646',
            color: '#aaa',
            borderRadius: 16,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          Try 'n Buy
        </span>
      </div>

      {/* Product Grid */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/product/${product.id}`)}
                style={{
                  background: '#1f1f26',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid #2e2e3a',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.25', background: '#252530' }}>
                  <img src={product.thumbnail} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '3px 7px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3
                    }}
                  >
                    <span>⚡</span> 60 Mins
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3
                    }}
                  >
                    <WishlistButton
                      isWishlisted={isWishlisted}
                      onToggle={() => toggleWishlist(product.id)}
                      size={14}
                    />
                  </div>
                </div>

                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#9090a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {product.brand}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: '15px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.title}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>₹{product.price}</span>
                    <span style={{ fontSize: 11, color: '#707080', textDecoration: 'line-through' }}>₹{product.originalPrice}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{product.discountPercentage}% OFF</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
