'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';
import { 
  PRODUCTS, 
  SECTIONS_MANIFEST, 
  CATEGORIES_GRID_MANIFEST,
  WOMEN_SECTIONS_MANIFEST,
  WOMEN_CATEGORIES_GRID 
} from '@/data/catalog';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import MEN_CURATED_SECTIONS from '@/data/men_curated_sections.json';

export default function HomePage() {
  const { gender, wishlist, toggleWishlist, setIsCouponOpen } = useApp();
  const router = useRouter();

  const [activeSlide, setActiveSlide] = useState(0);
  const [showGuaranteeBanner, setShowGuaranteeBanner] = useState(true);

  // Exact authentic lookbook banners downloaded from Knot's ImageKit CDN
  const menLookbookCards = [
    {
      id: 'banana-club',
      title: 'Banana Club',
      img: '/assets/real/lookbook_banner_2.webp',
      route: '/product/29393'
    },
    {
      id: 'fkn-casanova',
      title: 'F/KN Casanova',
      img: '/assets/real/lookbook_banner_1.webp',
      route: '/product/36440'
    },
    {
      id: 'powerlook',
      title: 'Powerlook',
      img: '/assets/real/lookbook_banner_4.webp',
      route: '/product/37600'
    },
    {
      id: 'on3mile',
      title: 'On3Mile',
      img: '/assets/real/lookbook_banner_9.webp',
      route: '/product/31561'
    },
    {
      id: 'brand-spotlight',
      title: 'Brand Spotlight',
      img: '/assets/real/lookbook_banner_6.webp',
      route: '/product/12671'
    }
  ];

  const womenLookbookCards = [
    {
      id: 'dandiya-drops',
      title: 'Dandiya Drops',
      img: '/assets/real/lookbook_women_1_dandiya.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'desi-baddie',
      title: 'Desi Baddie',
      img: '/assets/real/lookbook_women_2_desibaddie.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'chkokko',
      title: 'Chkokko',
      img: '/assets/real/lookbook_women_3_chkokko.webp',
      route: '/collection/top'
    },
    {
      id: 'souled-store',
      title: 'The Souled Store',
      img: '/assets/real/lookbook_women_4_souledstore.webp',
      route: '/collection/dresses'
    },
    {
      id: 'pink-fort',
      title: 'Pink Fort',
      img: '/assets/real/lookbook_women_5_pinkfort.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'nee',
      title: 'नी New Collection',
      img: '/assets/real/lookbook_women_6_nee.webp',
      route: '/collection/ethnic'
    },
    {
      id: 'tequila',
      title: 'Tequila',
      img: '/assets/real/lookbook_women_7_tequila.webp',
      route: '/collection/dresses'
    },
    {
      id: 'tilt',
      title: 'Tilt Bamboo',
      img: '/assets/real/lookbook_women_8_tilt.webp',
      route: '/collection/bottom'
    }
  ];

  const lookbookCards = gender === 'women' ? womenLookbookCards : menLookbookCards;

  // Reset slide index on gender switch
  useEffect(() => {
    setActiveSlide(0);
  }, [gender]);

  // Auto-advance Lookbook carousel every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % lookbookCards.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [lookbookCards.length]);

  const prevSlideIndex = (activeSlide - 1 + lookbookCards.length) % lookbookCards.length;
  const nextSlideIndex = (activeSlide + 1) % lookbookCards.length;

  // 5 Main Hero Category Cards
  const womenCategories = [
    { name: 'Ethnic Wear', img: '/assets/real/cat_women_ethnic_card.png', route: '/collection/ethnic' },
    { name: 'Dresses', img: '/assets/real/cat_women_dresses_card.png', route: '/collection/dresses' },
    { name: 'Bottom Wear', img: '/assets/real/cat_women_bottom_card.png', route: '/collection/bottom' },
    { name: 'Top Wear', img: '/assets/real/cat_women_top_card.png', route: '/collection/top' },
    { name: 'Foot Wear', img: '/assets/real/cat_women_footwear_card.png', route: '/collection/footwear' }
  ];

  const menCategories = [
    { name: 'Ethnic Wear', img: '/assets/real/cat_ethnic.webp', route: '/collection/ethnic' },
    { name: 'Bottom Wear', img: '/assets/real/cat_bottom.webp', route: '/collection/bottom' },
    { name: 'Top Wear', img: '/assets/real/cat_top.webp', route: '/collection/top' },
    { name: 'Foot Wear', img: '/assets/real/cat_footwear.webp', route: '/collection/footwear' },
    { name: 'Accessories', img: '/assets/real/cat_accessories.webp', route: '/collection/accessories' }
  ];

  const heroCategories = gender === 'women' ? womenCategories : menCategories;

  // Subcategories rail (Row 3)
  const menSubCategories = (CATEGORIES_GRID_MANIFEST['2'] || []).slice(0, 8).map(c => ({
    name: c.alt || 'Category',
    img: c.img,
    route: '/collection/top'
  }));
  const subCategories = gender === 'women' ? WOMEN_CATEGORIES_GRID : menSubCategories;

  // Brand Partners Rail (Row 4)
  const menBrandPartners = (SECTIONS_MANIFEST['8'] || []).map(b => ({
    name: b.alt,
    img: b.img,
    tag: 'Official Partner',
    route: '/categories'
  }));
  const womenBrandPartners = (WOMEN_SECTIONS_MANIFEST.brandPartners || []).map(b => ({
    name: b.name,
    img: b.img,
    tag: b.tag,
    route: '/categories'
  }));
  const brandPartners = gender === 'women' ? womenBrandPartners : menBrandPartners;

  // MEN Curated Sections
  const iconicLooks = SECTIONS_MANIFEST['15'] || [];
  const latestDrops = SECTIONS_MANIFEST['16'] || [];
  const offersList = SECTIONS_MANIFEST['17'] || [];
  const snitchBanner = SECTIONS_MANIFEST['10']?.[0];
  const tigcBanner = SECTIONS_MANIFEST['12']?.[0];
  const bearHouseBanner = SECTIONS_MANIFEST['14']?.[0];

  const snitchProducts = PRODUCTS.filter((p) => p.gender === 'men' && p.brand.toLowerCase().includes('snitch')).slice(0, 8);
  const tigcProducts = PRODUCTS.filter((p) => p.gender === 'men' && p.brand.toLowerCase().includes('indian garage')).slice(0, 8);
  const bearHouseProducts = PRODUCTS.filter((p) => p.gender === 'men' && p.brand.toLowerCase().includes('bear house')).slice(0, 8);

  // WOMEN Curated Sections & Products
  const pinkFortBanner = WOMEN_SECTIONS_MANIFEST.banners.pinkFort;
  const chkokkoBanner = WOMEN_SECTIONS_MANIFEST.banners.chkokko;
  const souledStoreWomenBanner = WOMEN_SECTIONS_MANIFEST.banners.souledStore;
  const desiBaddieBanner = WOMEN_SECTIONS_MANIFEST.banners.desiBaddie;

  const womenEthnicProducts = PRODUCTS.filter((p) => p.gender === 'women' && p.category === 'ethnic').slice(0, 8);
  const pinkFortProducts = PRODUCTS.filter((p) => p.gender === 'women' && (p.brand.toLowerCase().includes('pink fort') || p.brand.toLowerCase().includes('vasavi') || p.brand.toLowerCase().includes('divena') || p.category === 'dresses')).slice(0, 8);
  const chkokkoProducts = PRODUCTS.filter((p) => p.gender === 'women' && (p.brand.toLowerCase().includes('chkokko') || p.category === 'top' || p.category === 'bottom')).slice(0, 8);
  const souledStoreWomenProducts = PRODUCTS.filter((p) => p.gender === 'women' && p.brand.toLowerCase().includes('souled store')).slice(0, 8);

  // Strictly gender-pure trending products
  const trendingProducts = PRODUCTS.filter((p) => p.gender === gender).slice(0, 20);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#171717', overflow: 'hidden', position: 'relative' }}>
      <TopHeader />

      {/* Main Scrollable Content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 85 }}>
        {/* ========================================================
            SECTION 1: HERO SALE BANNER (MAGENTA WALLPAPER)
            Seamlessly merged with TopHeader background without any visible seam
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: "url('/assets/real/hero_slice_01_header.webp') center -108px / 100% auto repeat, #200416",
            position: 'relative',
            lineHeight: 0
          }}
        >
          {/* Authentic Freakin' Festive Sale Banner */}
          <div
            onClick={() => setIsCouponOpen(true)}
            style={{
              width: '100%',
              cursor: 'pointer',
              display: 'block',
              lineHeight: 0
            }}
          >
            <img
              src="/assets/real/hero_slice_02_sale_merged_tight.png"
              alt="Freakin' Festive Sale - Extra ₹999 Off On All Orders"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </section>

        {/* ========================================================
            SECTION 2: 5 CATEGORY CARDS RAIL (GREY BACKGROUND)
            Clean dark grey background matching Knot's native design
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: '#171717',
            padding: '6px 10px 16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 7
            }}
          >
            {heroCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => router.push(cat.route)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0,
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '75 / 83',
                    borderRadius: 12,
                    background: 'transparent',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 6,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    letterSpacing: -0.2,
                    fontFamily: 'Satoshi, sans-serif'
                  }}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            SECTION 3: LOOKBOOK CAROUSEL (MEN vs WOMEN 1:1)
            ======================================================== */}
        <section
          style={{
            width: '100%',
            background: '#171717',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: 0,
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 462,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              {/* Horizontal Track Centering the Active Card with Natural Peeks */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -35) {
                    setActiveSlide(nextSlideIndex);
                  } else if (info.offset.x > 35) {
                    setActiveSlide(prevSlideIndex);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'grab'
                }}
              >
                {/* Left Peek Card */}
                <div
                  onClick={() => setActiveSlide(prevSlideIndex)}
                  style={{
                    width: 340,
                    height: 454,
                    borderRadius: 20,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={lookbookCards[prevSlideIndex].img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                {/* Center Active Card */}
                <motion.div
                  key={`${gender}-${activeSlide}`}
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => router.push(lookbookCards[activeSlide].route)}
                  style={{
                    width: 340,
                    height: 454,
                    borderRadius: 20,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={lookbookCards[activeSlide].img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </motion.div>

                {/* Right Peek Card */}
                <div
                  onClick={() => setActiveSlide(nextSlideIndex)}
                  style={{
                    width: 340,
                    height: 454,
                    borderRadius: 20,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={lookbookCards[nextSlideIndex].img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Authentic Home Page End Curve from Knot */}
            <div
              style={{
                width: '100%',
                position: 'relative',
                marginTop: -42,
                zIndex: 1,
                pointerEvents: 'none'
              }}
            >
              <img
                src="/assets/images/hp_end_curve_dark.webp"
                alt=""
                style={{
                  width: '100%',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            ROW 3: AUTHENTIC CATEGORY GRID / SUBCATEGORIES
            ======================================================== */}
        <section style={{ padding: '4px 0 16px' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              padding: '0 12px',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none'
            }}
          >
            {subCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => router.push(cat.route)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: 72,
                  scrollSnapAlign: 'start'
                }}
              >
                <div
                  style={{
                    width: 66,
                    height: 72,
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#1a1a22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#ffffff',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 70
                  }}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            ROW 4: BRAND PARTNERS CAROUSEL
            ======================================================== */}
        {brandPartners.length > 0 && (
          <section style={{ padding: '0 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Featured Brands</h2>
              <span onClick={() => router.push('/categories')} style={{ fontSize: 11, fontWeight: 700, color: gender === 'women' ? '#ff5768' : '#38bdf8', cursor: 'pointer' }}>
                All Brands →
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                padding: '0 12px',
                scrollbarWidth: 'none'
              }}
            >
              {brandPartners.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/categories')}
                  style={{
                    flexShrink: 0,
                    width: 110,
                    height: 140,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#1c1c24',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}
                >
                  <img
                    src={b.img}
                    alt={b.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================
            GENDER SPECIFIC CURATED CONTENT
            ======================================================== */}
        {gender === 'men' ? (
          <>
            {/* ROW 5 (MEN): What's your next iconic look? */}
            {iconicLooks.length > 0 && (
              <section style={{ padding: '0 0 18px' }}>
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>What's your next iconic look?</h2>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    padding: '0 12px',
                    scrollbarWidth: 'none'
                  }}
                >
                  {iconicLooks.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push('/collection/top')}
                      style={{
                        flexShrink: 0,
                        width: 78,
                        height: 124,
                        borderRadius: 14,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1a1a24'
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ROW 6 (MEN): Latest Drops */}
            {latestDrops.length > 0 && (
              <section style={{ padding: '0 0 18px' }}>
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Latest Drops</h2>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    padding: '0 12px',
                    scrollbarWidth: 'none'
                  }}
                >
                  {latestDrops.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push('/collection/bottom')}
                      style={{
                        flexShrink: 0,
                        width: 100,
                        height: 140,
                        borderRadius: 16,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1c1c24'
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ROW 7 (MEN): Offers */}
            {offersList.length > 0 && (
              <section style={{ padding: '0 0 18px' }}>
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Offers</h2>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    padding: '0 12px',
                    scrollbarWidth: 'none'
                  }}
                >
                  {offersList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push('/collection/ethnic')}
                      style={{
                        flexShrink: 0,
                        width: 105,
                        height: 140,
                        borderRadius: 16,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1c1c24'
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================
                ALL 29 AUTHENTIC CURATED ROWS WITH REAL DOWNLOADED BACKGROUNDS
                Exact Section-by-Section 1:1 Mirroring of Knot Men's Feed
                ======================================================== */}
            {(MEN_CURATED_SECTIONS as any[]).map((section: any) => {
              if (section.hasBg) {
                return (
                  <section
                    key={section.id}
                    id={`section-${section.id}`}
                    style={{
                      width: '100%',
                      position: 'relative',
                      marginBottom: 18,
                      backgroundImage: `url("${section.bgImage}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'top center',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: '#121216',
                      paddingTop: 116,
                      paddingBottom: 16,
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        overflowX: 'auto',
                        paddingLeft: 12,
                        paddingRight: 12,
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {section.products.map((prod: any) => (
                        <div
                          key={prod.id}
                          onClick={() => router.push(`/product/${prod.id}`)}
                          style={{
                            flexShrink: 0,
                            width: 162,
                            borderRadius: 16,
                            overflow: 'hidden',
                            background: '#1d1e24',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Image Box */}
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: 190,
                              background: '#25262e',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={prod.thumbnail || prod.images[0]}
                              alt={prod.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />

                            {/* Wishlist Heart Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(prod.id);
                              }}
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                background: 'rgba(0, 0, 0, 0.4)',
                                backdropFilter: 'blur(4px)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 3
                              }}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill={wishlist.includes(prod.id) ? '#ff3b30' : 'none'}
                                stroke={wishlist.includes(prod.id) ? '#ff3b30' : '#ffffff'}
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                            </button>

                            {/* Authentic Badge Pill */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                background: 'linear-gradient(90deg, #6b21a8, #9333ea)',
                                padding: '2px 7px',
                                borderRadius: 4,
                                fontSize: 9,
                                fontWeight: 800,
                                color: '#ffffff',
                                letterSpacing: 0.2,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              EXTRA ₹999 OFF
                            </div>
                          </div>

                          {/* Card Content */}
                          <div
                            style={{
                              padding: '10px 10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                              background: '#1d1e24'
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#ffffff',
                                fontFamily: 'Satoshi, sans-serif',
                                letterSpacing: -0.2
                              }}
                            >
                              {prod.brand}
                            </div>

                            <div
                              style={{
                                fontSize: 11,
                                color: '#a0a0ab',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: 'Satoshi, sans-serif'
                              }}
                            >
                              {prod.title}
                            </div>

                            {/* Price Row */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 2
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: '#ffffff',
                                  fontFamily: 'Satoshi, sans-serif'
                                }}
                              >
                                {prod.priceFormatted || `₹${prod.price}`}
                              </span>
                              {prod.mrpFormatted && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: '#71717a',
                                    textDecoration: 'line-through'
                                  }}
                                >
                                  {prod.mrpFormatted}
                                </span>
                              )}
                              {prod.discountPercentage && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#4f7fff'
                                  }}
                                >
                                  {prod.discountPercentage}
                                </span>
                              )}
                            </div>

                            {/* Best Price */}
                            <div
                              style={{
                                fontSize: 10,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                marginTop: 1
                              }}
                            >
                              <span style={{ color: '#00e676', fontWeight: 700 }}>
                                Best Price {prod.bestPrice || `₹${Math.round(prod.price * 0.75)}`}
                              </span>
                              <span style={{ color: '#9e9ea7', fontWeight: 500 }}>
                                {prod.withCouponText || ' with coupon'}
                              </span>
                            </div>

                            {/* Delivery */}
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                marginTop: 2
                              }}
                            >
                              <span style={{ color: '#00e5ff' }}>⚡</span>
                              <span>{prod.deliveryText || '60 mins delivery'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              // Brand Carousel rows without background (SNITCH, The Indian Garage Co)
              const brandBannerImg = section.id === '2966'
                ? '/assets/real/sections/10_snitch_0.webp'
                : '/assets/real/sections/12_the_indian_garage_co_0.webp';

              return (
                <section key={section.id} id={`section-${section.id}`} style={{ padding: '0 12px 18px' }}>
                  <div
                    onClick={() => router.push('/categories')}
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      marginBottom: 10,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                    }}
                  >
                    <img
                      src={brandBannerImg}
                      alt={section.title}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {section.products.map((prod: any) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        isWishlisted={wishlist.includes(prod.id)}
                        onToggleWishlist={() => toggleWishlist(prod.id)}
                        onClick={() => router.push(`/product/${prod.id}`)}
                        style={{ flexShrink: 0, width: 145 }}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        ) : (
          <>
            {/* ROW 5 (WOMEN): DESI BADDIE / FESTIVE DROPS */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/ethnic')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                <img
                  src={desiBaddieBanner}
                  alt="Desi Baddie - Festive Glam"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {womenEthnicProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {womenEthnicProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 6 (WOMEN): PINK FORT NEW COLLECTION */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/ethnic')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src={pinkFortBanner}
                  alt="Pink Fort - New Collection"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {pinkFortProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {pinkFortProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 7 (WOMEN): CHKOKKO ACTIVEWEAR & CO-ORDS */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/top')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src={chkokkoBanner}
                  alt="Chkokko - Buy 2 Get 5% Off"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {chkokkoProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {chkokkoProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ROW 8 (WOMEN): THE SOULED STORE WOMEN */}
            <section style={{ padding: '0 12px 18px' }}>
              <div
                onClick={() => router.push('/collection/dresses')}
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginBottom: 10,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src={souledStoreWomenBanner}
                  alt="The Souled Store Women - Buy 1 Get 1"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {souledStoreWomenProducts.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                  }}
                >
                  {souledStoreWomenProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={() => toggleWishlist(prod.id)}
                      onClick={() => router.push(`/product/${prod.id}`)}
                      style={{ flexShrink: 0, width: 145 }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================================
            ROW 10: TRENDING IN 60 MINS (Strictly 100% Current Gender)
            ======================================================== */}
        <section style={{ padding: '0 12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Trending In 60 Mins</h2>
            <Link
              href="/categories"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: gender === 'women' ? '#ff5768' : '#6678ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              See All →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10
            }}
          >
            {trendingProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isWishlisted={wishlist.includes(prod.id)}
                onToggleWishlist={() => toggleWishlist(prod.id)}
                onClick={() => router.push(`/product/${prod.id}`)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* ========================================================
          EXACT FLOATING RIDER GUARANTEE PILL
          "We bet ₹250 this reaches you in time"
          Directly from Knot's CDN
          ======================================================== */}
      <AnimatePresence>
        {showGuaranteeBanner && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [0, -3, 0], opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{
              y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
              opacity: { duration: 0.3 }
            }}
            style={{
              position: 'absolute',
              bottom: 66,
              left: 10,
              right: 10,
              zIndex: 40,
              cursor: 'pointer',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => alert('⚡ KNOT 60-Minute Guarantee: If your fashion fit takes longer than 60 mins to reach your door, ₹250 is instantly credited to your Knot Wallet!')}
          >
            <img
              src="/assets/real/late_delivery_floater.webp"
              alt="We bet ₹250 this reaches you in time"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/exact/rider_guarantee_pill.webp';
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGuaranteeBanner(false);
              }}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/assets/icons/cross_close.svg" alt="Close" style={{ width: 14, height: 14 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docked Authentic Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
