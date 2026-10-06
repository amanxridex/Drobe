'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { CATEGORIES_DATA } from '@/data/catalog';

export default function CategoriesPage() {
  const router = useRouter();
  const { gender, setGender } = useApp();

  const categories = gender === 'men' ? CATEGORIES_DATA.men : CATEGORIES_DATA.women;

  const brands = [
    { name: 'The Souled Store', tag: 'Oversized & Polos' },
    { name: 'SNITCH', tag: 'Fast Drops & Denim' },
    { name: 'The Indian Garage Co', tag: 'Co-Ords & Casuals' },
    { name: 'TASVA', tag: 'Designer Kurta Sets' },
    { name: 'Manyavar', tag: 'Wedding & Festive' },
    { name: 'Powerlook', tag: 'Modern Heritage' },
    { name: 'Chapter 2', tag: 'Streetwear Luxury' },
    { name: 'CHUPPS', tag: 'Footwear & Sliders' },
    { name: 'Bonkers Corner', tag: 'Anime & Graphic Tees' },
    { name: 'Bewakoof', tag: 'Heavy Gauge Basics' },
    { name: 'Underrated Club', tag: 'Statement Streetwear' },
    { name: 'The Bear House', tag: 'Premium Casuals' }
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
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Categories</h1>
        </div>

        <Link href="/search" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/assets/icons/search.svg" alt="Search" style={{ width: 20, height: 20 }} />
        </Link>
      </header>

      {/* Men / Women Segmented Bar */}
      <div style={{ padding: '12px 16px 8px', background: '#1c1c24' }}>
        <div
          style={{
            background: '#252530',
            borderRadius: 12,
            padding: 3,
            display: 'flex',
            border: '1px solid #323240'
          }}
        >
          <button
            onClick={() => setGender('men')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              border: 'none',
              background: gender === 'men' ? '#6678ff' : 'transparent',
              color: gender === 'men' ? '#ffffff' : '#888888',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Men's Fashion
          </button>
          <button
            onClick={() => setGender('women')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              border: 'none',
              background: gender === 'women' ? '#6678ff' : 'transparent',
              color: gender === 'women' ? '#ffffff' : '#888888',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Women's Fashion
          </button>
        </div>
      </div>

      {/* Main Categories Grid */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Curated Collections
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => router.push(`/collection/${cat.id}`)}
              style={{
                background: '#202029',
                border: '1px solid #2e2e3c',
                borderRadius: 18,
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ height: 110, width: '100%', background: '#262633', position: 'relative' }}>
                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)'
                  }}
                />
              </div>

              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{cat.name}</span>
                <img src="/assets/icons/right.svg" alt="" style={{ width: 12, height: 12, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Featured Verified Brands */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Verified Brands
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {brands.map((b) => (
            <div
              key={b.name}
              onClick={() => router.push('/collection/top')}
              style={{
                background: '#202029',
                border: '1px solid #2d2d3a',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{b.tag}</div>
              </div>
              <img src="/assets/icons/right.svg" alt="" style={{ width: 12, height: 12, opacity: 0.5 }} />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
