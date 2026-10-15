'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Product, PRODUCTS } from '@/data/catalog';
import DISCOVER_BRANDS_DATA from '@/data/discover_brands_manifest.json';
import { 
  supabaseFetchBrandById, 
  supabaseFetchBrandProducts, 
  slugify 
} from '@/app/lib/supabaseClient';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

function isProductFromBrand(
  productBrand: string | undefined,
  brandSlug: string,
  strippedBrandName: string,
  brandDisplayName?: string
): boolean {
  if (!productBrand) return false;
  const pb = productBrand.trim().toLowerCase();
  if (!pb) return false;
  const pbSlug = slugify(pb);
  const targetStripped = strippedBrandName.trim().toLowerCase();
  const targetName = (brandDisplayName || '').trim().toLowerCase();

  if (pbSlug === brandSlug || pbSlug === slugify(strippedBrandName)) return true;
  if (targetStripped && pb === targetStripped) return true;
  if (targetName && targetName.length >= 2) {
    if (pb === targetName) return true;
    if (pb.includes(targetName) || targetName.includes(pb)) return true;
  }
  return false;
}

export default function BrandPage() {
  const params = useParams();
  const router = useRouter();
  const { cart, wishlist, toggleWishlist } = useApp();

  const rawBrandId = (params?.id as string) || '';
  const decodedBrandId = decodeURIComponent(rawBrandId);
  const brandSlug = slugify(decodedBrandId);

  // Clean stripped name for fallback search (e.g. "WHAT THE FLEX" from "home-discover-brand-what-the-flex-men")
  const strippedBrandName = decodedBrandId
    .replace(/^home_discover_brand_|^home-discover-brand-/, '')
    .replace(/_men$|_women$|-men$|-women$/, '')
    .replace(/[_-]/g, ' ')
    .trim();

  // State
  const [brandData, setBrandData] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'low' | 'high'>('popular');
  const [showStory, setShowStory] = useState(false);

  // 1. Initial Local Fallback from static catalog & manifest
  const fallbackBrand = useMemo(() => {
    // Check manifest slides
    let foundInManifest: any = null;
    if (DISCOVER_BRANDS_DATA && Array.isArray(DISCOVER_BRANDS_DATA.slides)) {
      for (const slide of DISCOVER_BRANDS_DATA.slides) {
        if (Array.isArray(slide)) {
          const match = slide.find(
            b => slugify(b.name) === brandSlug || 
                 slugify(b.name) === slugify(strippedBrandName) ||
                 b.deeplink?.includes(rawBrandId)
          );
          if (match) {
            foundInManifest = match;
            break;
          }
        }
      }
    }

    // Check catalog products for matching brand
    const matchingCatalogProds = PRODUCTS.filter(
      p => slugify(p.brand) === brandSlug || 
           slugify(p.brand) === slugify(strippedBrandName) ||
           p.brand.toLowerCase() === strippedBrandName.toLowerCase()
    );

    const brandDisplayName = foundInManifest?.name || 
      matchingCatalogProds[0]?.brand || 
      strippedBrandName.toUpperCase();

    return {
      id: brandSlug,
      name: brandDisplayName,
      tagline: `${brandDisplayName} • Designer Collection`,
      category: matchingCatalogProds[0]?.category || 'Contemporary Fashion',
      profile_image: foundInManifest?.img || matchingCatalogProds[0]?.thumbnail || '/assets/real/brands/brand_0.webp',
      cover_image: matchingCatalogProds[0]?.images?.[0] || foundInManifest?.img || '/assets/real/lookbook_banner_2.webp',
      about: `${brandDisplayName} brings signature silhouettes and premium styling directly from Ahmedabad Darkstore Hub #01 for instant 30-minute doorstep trial.`,
      mission: `Crafting bespoke, contemporary fits delivered to your doorstep in 30 minutes with zero friction.`,
      based_out_of: 'Ahmedabad Hub (SG Highway)',
      established_year: '2023',
      initialProducts: matchingCatalogProds
    };
  }, [brandSlug, strippedBrandName, rawBrandId]);

  // 2. Fetch live Brand and Products from Supabase DB
  useEffect(() => {
    let isMounted = true;

    async function loadBrandDataFromDb() {
      setLoading(true);

      try {
        // Query Brand from drobe_brands
        const dbBrand = await supabaseFetchBrandById(rawBrandId);
        
        // Query Products from drobe_products
        const brandNameSearch = dbBrand?.name || fallbackBrand.name;
        const dbProducts = await supabaseFetchBrandProducts(rawBrandId, brandNameSearch);

        if (isMounted) {
          if (dbBrand) {
            setBrandData(dbBrand);
          } else {
            setBrandData(fallbackBrand);
          }

          const targetDisplayName = dbBrand?.name || fallbackBrand.name;
          const strictlyBrandIsolated = (dbProducts || []).filter(p =>
            isProductFromBrand(p.brand, brandSlug, strippedBrandName, targetDisplayName)
          );

          if (strictlyBrandIsolated.length > 0) {
            setProducts(strictlyBrandIsolated);
          } else if (fallbackBrand.initialProducts && fallbackBrand.initialProducts.length > 0) {
            const fallbackIsolated = fallbackBrand.initialProducts.filter(p =>
              isProductFromBrand(p.brand, brandSlug, strippedBrandName, targetDisplayName)
            );
            setProducts(fallbackIsolated);
          } else {
            // STRICT BRAND ISOLATION: Never show products of other brands!
            setProducts([]);
          }
        }
      } catch (err) {
        console.warn('Error loading brand live data:', err);
        if (isMounted) {
          setBrandData(fallbackBrand);
          const fallbackIsolated = (fallbackBrand.initialProducts || []).filter(p =>
            isProductFromBrand(p.brand, brandSlug, strippedBrandName, fallbackBrand.name)
          );
          setProducts(fallbackIsolated);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBrandDataFromDb();

    return () => {
      isMounted = false;
    };
  }, [rawBrandId, fallbackBrand, brandSlug, strippedBrandName]);

  const activeBrand = brandData || fallbackBrand;

  // Categories present in this brand's product catalog
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    products.forEach(p => {
      if (p.category) {
        cats.add(p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase());
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (sortBy === 'low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, selectedCategory, sortBy]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#121214', overflowX: 'hidden' }}>
      
      {/* ========================================================
          1. AUTHENTIC DROBE PLP HEADER
          Back Arrow + Drobe Logo | Brand Title | Wishlist + Cart
          ======================================================== */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '12px 16px',
          background: 'rgba(18, 18, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #1f1f23',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Left: Back Arrow + Drobe Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <img
              src="/drobe-emblem-white.png"
              alt="DROBE"
              style={{ height: 22, width: 'auto', objectFit: 'contain' }}
            />
            <img
              src="/drobe-wordmark-white.png"
              alt="DROBE"
              style={{ height: 16, width: 'auto', objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* Center: Brand Name */}
        <div style={{ textAlign: 'center', maxWidth: 170, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Satoshi, sans-serif'
            }}
          >
            {activeBrand.name}
          </div>
          <p style={{ fontSize: 10, color: '#00d26a', margin: '1px 0 0 0', fontWeight: 600 }}>
            ● LIVE IN DARKSTORE
          </p>
        </div>

        {/* Right: Search & Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/search" style={{ color: '#fff', textDecoration: 'none', display: 'flex' }} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          <Link href="/cart" style={{ color: '#fff', textDecoration: 'none', position: 'relative', display: 'flex' }} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  background: '#ff2a85',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ flex: 1, paddingBottom: 90 }}>

        {/* ========================================================
            2. LUXURY BRAND PROFILE HERO BANNER
            Cover Banner + Brand Avatar + Tagline + Metrics
            ======================================================== */}
        <div style={{ position: 'relative', background: '#17171c', borderBottom: '1px solid #23232b' }}>
          
          {/* Cover Header Banner */}
          <div
            style={{
              height: 140,
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1c1917 0%, #09090b 100%)'
            }}
          >
            {activeBrand.cover_image && (
              <img
                src={activeBrand.cover_image}
                alt={activeBrand.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.55) contrast(1.1)'
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(18,18,20,0.2) 0%, rgba(18,18,20,0.9) 100%)'
              }}
            />

            {/* Express Hub Pill Badge */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span style={{ color: '#00d26a', fontSize: 10 }}>⚡</span>
              <span style={{ color: '#ffffff', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3 }}>
                30-MIN EXPRESS TRIAL
              </span>
            </div>
          </div>

          {/* Brand Info Overlay */}
          <div style={{ padding: '0 16px 16px 16px', marginTop: -40, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              
              {/* Brand Logo Avatar */}
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 20,
                  background: '#ffffff',
                  border: '3px solid #121214',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <img
                  src={activeBrand.profile_image || '/assets/real/brands/brand_0.webp'}
                  alt={activeBrand.name}
                  style={{
                    width: '90%',
                    height: '90%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Status / Category Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span
                  style={{
                    background: '#23242e',
                    border: '1px solid #323340',
                    color: '#e4e4e7',
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 8
                  }}
                >
                  {activeBrand.category || 'Apparel'}
                </span>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#60a5fa',
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  VERIFIED BRAND
                </span>
              </div>
            </div>

            {/* Brand Title & Tagline */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    fontFamily: 'Satoshi, sans-serif'
                  }}
                >
                  {activeBrand.name}
                </h1>
              </div>

              <p style={{ fontSize: 12.5, color: '#9ca3af', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {activeBrand.tagline || `${activeBrand.name} • Contemporary High Fashion • Inwarded to Hub`}
              </p>

              {/* Hub Location & Stats Rail */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 10,
                  fontSize: 11.5,
                  color: '#a1a1aa'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{activeBrand.based_out_of || 'Ahmedabad Hub #01'}</span>
                </div>
                {products.length > 0 && (
                  <>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>{products.length}</span>
                      <span>{products.length === 1 ? 'Product' : 'Products'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Story / About Accordion */}
              {activeBrand.about && (
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => setShowStory(prev => !prev)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#60a5fa',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>{showStory ? 'Hide brand dossier' : 'About the brand & craft'}</span>
                    <span style={{ fontSize: 9 }}>{showStory ? '▲' : '▼'}</span>
                  </button>

                  {showStory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        marginTop: 8,
                        padding: '10px 12px',
                        background: '#1c1c24',
                        border: '1px solid #292934',
                        borderRadius: 10,
                        fontSize: 12,
                        color: '#d4d4d8',
                        lineHeight: 1.5
                      }}
                    >
                      <p style={{ margin: 0 }}>{activeBrand.about}</p>
                      {activeBrand.mission && (
                        <p style={{ margin: '8px 0 0 0', color: '#a1a1aa', fontSize: 11.5 }}>
                          <strong style={{ color: '#fff' }}>Mission:</strong> {activeBrand.mission}
                        </p>
                      )}
                      {activeBrand.founder_name && (
                        <p style={{ margin: '6px 0 0 0', color: '#8e8e93', fontSize: 11 }}>
                          Directed by {activeBrand.founder_name} ({activeBrand.founder_role || 'Founder'})
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Darkstore Guarantees Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid #23232c'
              }}
            >
              <div style={{ background: '#1c1c24', padding: '8px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#00d26a' }}>30 Mins</div>
                <div style={{ fontSize: 9.5, color: '#8e8e93', marginTop: 1 }}>Express Fitting</div>
              </div>
              <div style={{ background: '#1c1c24', padding: '8px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>Try & Buy</div>
                <div style={{ fontSize: 9.5, color: '#8e8e93', marginTop: 1 }}>Zero Prepay</div>
              </div>
              <div style={{ background: '#1c1c24', padding: '8px', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>100% Genuine</div>
                <div style={{ fontSize: 9.5, color: '#8e8e93', marginTop: 1 }}>Verified SKU</div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            3. CATEGORY PILLS & SORTING BAR (Only shown when products exist)
            ======================================================== */}
        {products.length > 0 && (
          <div
            style={{
              position: 'sticky',
              top: 57,
              zIndex: 35,
              background: '#121214',
              borderBottom: '1px solid #1f1f25',
              padding: '10px 16px'
            }}
          >
            {/* Category Filter Chips */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                paddingBottom: 4
              }}
            >
              {availableCategories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: isSelected ? '1px solid #ffffff' : '1px solid #2b2b36',
                      background: isSelected ? '#ffffff' : '#1c1d24',
                      color: isSelected ? '#000000' : '#a1a1aa',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sub Bar: Items Count + Sort */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid #1b1b20'
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8e8e93' }}>
                Showing {filteredProducts.length} items
              </span>

              {/* Sort Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#71717a' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    background: '#1a1a22',
                    color: '#ffffff',
                    border: '1px solid #2e2f3d',
                    borderRadius: 8,
                    fontSize: 11.5,
                    padding: '3px 8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="popular">Popular</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            4. LIVE PRODUCT GRID (Authentic Drobe Luxury ProductCard)
            ======================================================== */}
        <div style={{ padding: '14px 12px 20px 12px' }}>
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12
              }}
            >
              {[1, 2, 3, 4].map(idx => (
                <div
                  key={idx}
                  style={{
                    background: '#1f1f25',
                    borderRadius: 16,
                    height: 280,
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12
              }}
            >
              {filteredProducts.map((p) => {
                const isWish = wishlist.includes(p.id);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isWishlisted={isWish}
                    onToggleWishlist={() => toggleWishlist(p.id)}
                    onClick={() => router.push(`/product/${p.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                background: '#17171c',
                borderRadius: 16,
                border: '1px solid #252530',
                marginTop: 20
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>
                {products.length === 0 ? 'New Drops Coming Soon' : 'No items found'}
              </h3>
              <p style={{ fontSize: 12, color: '#8e8e93', marginTop: 4, maxWidth: 280, marginInline: 'auto' }}>
                {products.length === 0
                  ? `${activeBrand.name} inventory is being inwarded and shelved at Ahmedabad Darkstore Hub.`
                  : `No products match the selected filter for ${activeBrand.name}.`}
              </p>
              {products.length > 0 ? (
                <button
                  onClick={() => setSelectedCategory('All')}
                  style={{
                    marginTop: 16,
                    padding: '8px 18px',
                    borderRadius: 10,
                    background: '#ffffff',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View All {activeBrand.name} Items
                </button>
              ) : (
                <button
                  onClick={() => router.push('/categories')}
                  style={{
                    marginTop: 16,
                    padding: '8px 18px',
                    borderRadius: 10,
                    background: '#ffffff',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: 12,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Explore Other Brands
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
