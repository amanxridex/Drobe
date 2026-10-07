'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { CATEGORIES_DATA } from '@/data/catalog';

export default function CategoriesPage() {
  const router = useRouter();
  const { gender, setGender, cart } = useApp();

  const categories = gender === 'men' ? CATEGORIES_DATA.men : CATEGORIES_DATA.women;

  const menBrands = [
    { name: 'SNITCH', tag: 'Fast Drops & Street Denim', cat: 'top' },
    { name: 'The Indian Garage Co', tag: 'Casual Shirts & Co-Ords', cat: 'top' },
    { name: 'The Bear House', tag: 'Premium Casuals & Polos', cat: 'top' },
    { name: 'TASVA', tag: 'Designer Kurta Sets & Bundis', cat: 'ethnic' },
    { name: 'Manyavar', tag: 'Royal Wedding & Festive', cat: 'ethnic' },
    { name: 'Powerlook', tag: 'Modern Heritage Streetwear', cat: 'bottom' },
    { name: 'Thomas Scott', tag: 'Oversized Check Shirts', cat: 'top' },
    { name: 'Chapter 2', tag: 'Streetwear Luxury Cargoes', cat: 'bottom' },
    { name: 'CHUPPS', tag: 'Footwear & Sliders', cat: 'footwear' },
    { name: 'The Souled Store', tag: 'Pop Culture & Oversized', cat: 'top' },
    { name: 'Underrated Club', tag: 'Statement Heavyweight Tees', cat: 'top' },
    { name: 'Bewakoof', tag: 'Heavy Gauge Basics', cat: 'top' }
  ];

  const womenBrands = [
    { name: 'Pink Fort', tag: 'Pure Chanderi & Embroidered Sets', cat: 'ethnic' },
    { name: 'The Souled Store', tag: 'Dresses, Tops & Everyday Chic', cat: 'dresses' },
    { name: 'CHKOKKO', tag: 'Activewear & Loungewear', cat: 'top' },
    { name: 'Vasavi', tag: 'Festive Velvet & Anarkali Suits', cat: 'ethnic' },
    { name: 'trueBrowns', tag: 'Minimalist Raw Silk Sets', cat: 'ethnic' },
    { name: 'KALKI Fashion', tag: 'Designer Sarees & Lehengas', cat: 'ethnic' },
    { name: 'Tequila', tag: 'Party Bodycon & Slip Dresses', cat: 'dresses' },
    { name: 'Tilt', tag: 'Eco-Bamboo Loungewear & Denims', cat: 'bottom' },
    { name: 'GIVA', tag: '925 Fine Silver Jewellery', cat: 'accessories' },
    { name: 'Chumbak', tag: 'Boho Watches, Bags & Lifestyle', cat: 'accessories' },
    { name: 'Sassafras', tag: 'Gen-Z Corsets & Cropped Tops', cat: 'top' },
    { name: 'Divena', tag: 'Handblock Printed Cotton Kurtas', cat: 'ethnic' }
  ];

  const brands = gender === 'men' ? menBrands : womenBrands;

  const womenSubcategories = [
    { name: 'Kurtas & Sets', img: '/assets/real/cat_women_sub_kurtas.webp', route: '/collection/ethnic' },
    { name: 'Sarees', img: '/assets/real/cat_women_sub_sarees.webp', route: '/collection/ethnic' },
    { name: 'Suits', img: '/assets/real/cat_women_sub_suits.webp', route: '/collection/ethnic' },
    { name: 'Corsets & Tops', img: '/assets/real/cat_women_sub_corsets.webp', route: '/collection/top' },
    { name: 'Sweaters & Knits', img: '/assets/real/cat_women_sub_sweaters.webp', route: '/collection/top' },
    { name: 'Pyjamas & Lounge', img: '/assets/real/cat_women_sub_pyjamas.webp', route: '/collection/bottom' },
    { name: 'Jewellery', img: '/assets/real/cat_women_sub_jewellery.webp', route: '/collection/accessories' }
  ];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#121214', overflow: 'hidden' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, marginLeft: 4, fontFamily: 'Satoshi, sans-serif' }}>Categories</h1>
        </div>

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

      {/* Men / Women Segmented Pill Bar */}
      <div style={{ padding: '10px 16px', background: '#161619', borderBottom: '1px solid #202026' }}>
        <div
          style={{
            background: '#222228',
            borderRadius: 9999,
            padding: 3,
            display: 'flex',
            border: '1px solid #2d2d38'
          }}
        >
          <button
            onClick={() => setGender('men')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 9999,
              border: 'none',
              background: gender === 'men' ? '#2563eb' : 'transparent',
              color: gender === 'men' ? '#ffffff' : '#8e8e93',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Satoshi, sans-serif'
            }}
          >
            Men&apos;s Fashion
          </button>
          <button
            onClick={() => setGender('women')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 9999,
              border: 'none',
              background: gender === 'women' ? '#ec4899' : 'transparent',
              color: gender === 'women' ? '#ffffff' : '#8e8e93',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Satoshi, sans-serif'
            }}
          >
            Women&apos;s Fashion
          </button>
        </div>
      </div>

      {/* Main Categories Grid */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 85px' }}>
        {/* Curated Collections Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>
            {gender === 'men' ? "Men's Collections" : "Women's Collections"}
          </h2>
          <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>⚡ 60-min delivery</span>
        </div>

        {/* Categories Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => router.push(`/collection/${cat.id}`)}
              style={{
                background: '#1d1d22',
                border: '1px solid #2b2b34',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ height: 120, width: '100%', background: '#24242c', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#19191e' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{cat.name}</span>
                <span style={{ color: '#8e8e93', fontSize: 13 }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Women Specific Subcategory Grid */}
        {gender === 'women' && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              Explore Subcategories
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {womenSubcategories.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => router.push(sub.route)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: '#1a1a20',
                    border: '1px solid #282832',
                    borderRadius: 14,
                    padding: '8px 4px',
                    textAlign: 'center'
                  }}
                >
                  <img src={sub.img} alt={sub.name} style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 6 }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#e4e4e7', lineHeight: 1.2 }}>{sub.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Verified Brands */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          {gender === 'men' ? "Verified Men's Brands" : "Verified Women's Brands"}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {brands.map((b) => (
            <div
              key={b.name}
              onClick={() => router.push(`/collection/${b.cat || 'ethnic'}`)}
              style={{
                background: '#1a1a20',
                border: '1px solid #272732',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>{b.tag}</div>
              </div>
              <span style={{ color: '#71717a', fontSize: 14 }}>→</span>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
